// src/components/OpenEnrollmentForm.js
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../components/Modal';
// --- CHANGE START: Removed unused import ---
import { getBenefitPlans } from '../services/benefitService';
// --- CHANGE END ---

function OpenEnrollmentForm({ employeeInfo, onClose, onSubmit }) {
    const [selections, setSelections] = useState({ plans: {} });
    const [benefitPlans, setBenefitPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlans() {
            setLoading(true);
            const plans = await getBenefitPlans();
            setBenefitPlans(plans);
            setLoading(false);
        }
        fetchPlans();
    }, []);

    // Group plans by type using useMemo for efficiency
    const organizedPlans = useMemo(() => {
        return benefitPlans.reduce((acc, plan) => {
            // --- THIS IS THE FIX ---
            // Ensure the plan has a valid plan_type before processing
            if (!plan || !plan.plan_type) {
                return acc;
            }

            (acc[plan.plan_type] = acc[plan.plan_type] || []).push(plan);
            
            // Add a "Waive" option for each benefit type
            if (!acc[plan.plan_type].some(p => p.plan_name === 'Waive')) {
                acc[plan.plan_type].unshift({
                    id: `waive-${plan.plan_type}`,
                    plan_type: plan.plan_type,
                    plan_name: 'Waive',
                    cost: 0,
                    description: `I do not wish to enroll in a ${plan.plan_type.toLowerCase()} plan.`,
                });
            }
            return acc;
        }, {});
    }, [benefitPlans]);

    const handleSelectPlan = (planType, plan) => {
        const isSelected = selections.plans[planType]?.id === plan.id;

        if (isSelected) {
            const newSelections = { ...selections.plans };
            delete newSelections[planType];
            setSelections(prev => ({ ...prev, plans: newSelections }));
        } else {
            setSelections(prev => ({
                ...prev,
                plans: {
                    ...prev.plans,
                    [planType]: {
                        id: plan.id,
                        name: plan.plan_name,
                        cost: plan.cost
                    }
                }
            }));
        }
    };
    
    const calculateTotals = () => {
        const monthlyTotal = Object.values(selections.plans).reduce((acc, plan) => acc + plan.cost, 0);
        const perPayPeriodTotal = monthlyTotal / 2;
        return { monthlyTotal, perPayPeriodTotal };
    };

    const { monthlyTotal, perPayPeriodTotal } = calculateTotals();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const enrollmentData = {
            employee_id: employeeInfo.employeeId,
            selections: selections.plans,
            total_cost: monthlyTotal
        };
        onSubmit(enrollmentData);
    };

    if (loading) {
        return (
            <Modal onClose={onClose}>
                <h2>Loading benefit plans...</h2>
            </Modal>
        );
    }

    return (
        <Modal onClose={onClose}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-2">Annual Open Enrollment</h1>
                <p className="text-center text-gray-600 mb-8">Please review your benefit options and make your selections.</p>

                <form onSubmit={handleFormSubmit} className="space-y-8">
                    {/* Employee Info Section */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-xl font-bold">Your Information</h2>
                        </div>
                        <div className="card-body">
                           <p><strong>Full Name:</strong> {employeeInfo.fullName}</p>
                           <p><strong>Employee ID:</strong> {employeeInfo.employeeId}</p>
                        </div>
                    </div>
                    
                    {/* Dynamically Rendered Plan Sections */}
                    {Object.entries(organizedPlans).map(([planType, plans]) => (
                        <div className="card" key={planType}>
                            <div className="card-header">
                                <h2 className="text-2xl font-bold">{planType} Plans</h2>
                            </div>
                            <div className="card-body grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => handleSelectPlan(planType, plan)}
                                        className={`plan-card ${selections.plans[planType]?.id === plan.id ? 'selected' : ''}`}
                                    >
                                        <h3 className="text-lg font-bold">{plan.plan_name}</h3>
                                        <p className="text-sm text-gray-600 mb-2 flex-grow">{plan.description}</p>
                                        <span className="text-lg font-semibold">${plan.cost}/mo</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Total Cost Summary & Submission */}
                    <div className="card">
                        <div className="card-header">
                          <h2 className="text-2xl font-bold">Summary & Total Cost</h2>
                        </div>
                        <div className="card-body">
                            <div className="summary-box">
                                {Object.keys(selections.plans).length === 0 ? (
                                    <p className="text-center text-gray-500 italic">No selections made yet.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {Object.entries(selections.plans).map(([type, plan]) => (
                                            <li key={type} className="flex justify-between">
                                                <span>{plan.name}</span>
                                                <span>${plan.cost}/mo</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 border-t border-gray-300 pt-4 flex justify-between items-center">
                                    <div>
                                        <span className="text-lg font-bold block">Estimated Monthly Total:</span>
                                        <span className="text-sm text-gray-500">Estimated Per-Pay-Period Total:</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-bold text-green-600 block">${monthlyTotal.toFixed(2)}</span>
                                        <span className="text-lg text-gray-600 block text-right">${perPayPeriodTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button type="submit" className="submit-button">
                                    Submit Enrollment
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default OpenEnrollmentForm;