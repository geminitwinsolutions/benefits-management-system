import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../components/Modal';
import { getPlansForEnrollmentPeriod } from '../services/benefitService';
import toast from 'react-hot-toast';

// Helper function to calculate age from date of birth
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Helper function to get the correct rate based on age, amount, and rate data
function getAgeBasedRate(age, rates, amount) {
    const ageBand = rates.find(band => {
        const [minAge, maxAge] = band.age_band.split('-').map(Number);
        return age >= minAge && age <= maxAge;
    });

    if (!ageBand) return null;
    return ageBand.rates.find(r => r.amount === amount);
}

function OpenEnrollmentForm({ employeeInfo, onClose, onSubmit, periodId, isPreview = false }) {
    const [selections, setSelections] = useState({ plans: {} });
    const [benefitPlans, setBenefitPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlans() {
            if (!periodId) {
                console.error("No enrollment period ID provided.");
                setLoading(false);
                return;
            }
            setLoading(true);
            const plans = await getPlansForEnrollmentPeriod(periodId);
            setBenefitPlans(plans);
            setLoading(false);
        }
        fetchPlans();
    }, [periodId]);

    const employeeAge = useMemo(() => calculateAge(employeeInfo.date_of_birth), [employeeInfo.date_of_birth]);

    const organizedPlans = useMemo(() => {
        return benefitPlans.reduce((acc, plan) => {
            if (!plan || !plan.plan_type) return acc;

            let planWithCost = { ...plan };
            if (plan.rate_model === 'AGE_BANDED_TIER') {
                planWithCost.options = (plan.benefit_rates[0]?.rates || []).map(band => {
                    return band.rates.map(r => ({
                        ...r,
                        display_name: `$${r.amount.toLocaleString()}`,
                        cost: (r.premium * (r.amount / 1000)) * (1 + (plan.client_margin / 100))
                    }));
                }).flat();
            } else {
                planWithCost.cost = (plan.benefit_rates[0]?.rates[0]?.carrier_rate || 0) * (1 + (plan.client_margin / 100));
            }

            (acc[plan.plan_type] = acc[plan.plan_type] || []).push(planWithCost);
            
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
    }, [benefitPlans, employeeAge]);

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
                    [planType]: { id: plan.id, name: plan.plan_name, cost: plan.cost }
                }
            }));
        }
    };

    const handleSelectLifeCoverage = (planType, plan, coverageOption) => {
        setSelections(prev => ({
            ...prev,
            plans: {
                ...prev.plans,
                [planType]: { id: plan.id, name: `${plan.plan_name} - ${coverageOption.display_name}`, cost: coverageOption.cost }
            }
        }));
    };
    
    // CORRECTED: Calculate totals using useMemo for safety and efficiency
    const { monthlyTotal, perPayPeriodTotal } = useMemo(() => {
        const monthlyTotal = Object.values(selections.plans).reduce((acc, plan) => acc + (plan.cost || 0), 0);
        const perPayPeriodTotal = monthlyTotal / 2;
        return { monthlyTotal, perPayPeriodTotal };
    }, [selections]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isPreview) {
            onSubmit();
            return;
        }
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
        <Modal onClose={onClose} size="large">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-2">Annual Open Enrollment {isPreview && '(Preview)'}</h1>
                <p className="text-center text-gray-600 mb-8">Please review your benefit options and make your selections.</p>
                <form onSubmit={handleFormSubmit} className="space-y-8">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-xl font-bold">Your Information</h2>
                        </div>
                        <div className="card-body">
                           <p><strong>Full Name:</strong> {employeeInfo.fullName}</p>
                           <p><strong>Employee ID:</strong> {employeeInfo.employeeId}</p>
                           <p><strong>Age:</strong> {employeeAge !== null ? employeeAge : 'N/A'}</p>
                        </div>
                    </div>
                    {Object.entries(organizedPlans).map(([planType, plans]) => (
                        <div className="card" key={planType}>
                            <div className="card-header">
                                <h2 className="text-2xl font-bold">{planType} Plans</h2>
                            </div>
                            <div className="card-body grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => { if (!plan.options) { handleSelectPlan(planType, plan); } }}
                                        className={`plan-card ${selections.plans[planType]?.id === plan.id ? 'selected' : ''}`}
                                    >
                                        <h3 className="text-lg font-bold">{plan.plan_name}</h3>
                                        <p className="text-sm text-gray-600 mb-2 flex-grow">{plan.description}</p>
                                        {plan.options ? (
                                            <div>
                                                <h4 className="text-sm font-semibold mt-2">Choose Coverage:</h4>
                                                {plan.options.map((option, index) => (
                                                    <div key={index} className="flex items-center mt-1">
                                                        <input
                                                            type="radio"
                                                            id={`${plan.id}-${index}`}
                                                            name={`${plan.id}`}
                                                            checked={selections.plans[planType]?.name === `${plan.plan_name} - ${option.display_name}`}
                                                            onChange={() => handleSelectLifeCoverage(planType, plan, option)}
                                                            className="mr-2"
                                                        />
                                                        <label htmlFor={`${plan.id}-${index}`}>
                                                            {option.display_name} - ${option.cost.toFixed(2)}/mo
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-lg font-semibold">${(plan.cost || 0).toFixed(2)}/mo</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
                                                <span>${(plan.cost || 0).toFixed(2)}/mo</span>
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
                                <button type="submit" className="submit-button" disabled={isPreview && monthlyTotal === 0}>
                                    {isPreview ? 'Close Preview' : 'Submit Enrollment'}
                                </button>
                                {isPreview && <p className="form-note" style={{marginTop: '1rem'}}>This is a preview. No data will be submitted.</p>}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default OpenEnrollmentForm;