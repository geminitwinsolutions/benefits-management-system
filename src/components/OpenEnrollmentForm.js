import React, { useState } from 'react';
import Modal from '../components/Modal';

function OpenEnrollmentForm({ employeeInfo, onClose, onSubmit }) {
    const [selections, setSelections] = useState({
        plans: {},
        dependents: employeeInfo.dependents.length
    });

    // Mock data for pay schedule
    const paySchedule = 'bi-weekly';

    const planCosts = {
        'Gold PPO': 150,
        'Silver HMO': 95,
        'Standard Dental': 25,
        'Vision Care': 10,
        'Gold PPO + Spouse': 300,
        'Gold PPO Family': 450,
        'Standard Dental Family': 50,
        'Vision Care Family': 20,
        'Waive': 0
    };

    const handleSelectPlan = (planType, planName, cost, coverage) => {
        const isFamilyPlan = coverage === 'family' || coverage === 'employee-plus-one';
        if (isFamilyPlan && selections.dependents < 1) {
            alert('Please add at least one dependent to select this plan.');
            return;
        }

        const isSelected = selections.plans[planType]?.name === planName;
        if (isSelected) {
            const newSelections = { ...selections.plans };
            delete newSelections[planType];
            setSelections(prev => ({ ...prev, plans: newSelections }));
        } else {
            setSelections(prev => ({
                ...prev,
                plans: { ...prev.plans, [planType]: { name: planName, cost, coverage } }
            }));
        }
    };

    const calculateTotals = () => {
        let monthlyTotal = 0;
        for (const plan in selections.plans) {
            monthlyTotal += selections.plans[plan].cost;
        }

        let perPayPeriodTotal = 0;
        if (paySchedule === 'weekly') {
            perPayPeriodTotal = monthlyTotal / 4;
        } else if (paySchedule === 'bi-weekly') {
            perPayPeriodTotal = monthlyTotal / 2;
        }

        return { monthlyTotal, perPayPeriodTotal };
    };

    const { monthlyTotal, perPayPeriodTotal } = calculateTotals();

    const planOptions = [
        { type: 'Medical', name: 'Waive', cost: 0, coverage: 'employee-only', description: 'I do not wish to enroll in a medical plan.' },
        { type: 'Medical', name: 'Gold PPO Plan', cost: 150, coverage: 'employee-only', description: 'Comprehensive coverage with a wide network of doctors.' },
        { type: 'Medical', name: 'Silver HMO Plan', cost: 95, coverage: 'employee-only', description: 'Lower premium option with in-network only coverage.' },
        { type: 'Medical', name: 'Gold PPO + Spouse', cost: 300, coverage: 'employee-plus-one', description: 'Covers you and your spouse with premium benefits.' },
        { type: 'Medical', name: 'Gold PPO Family', cost: 450, coverage: 'family', description: 'Covers the entire family with comprehensive benefits.' },
        { type: 'Dental', name: 'Waive', cost: 0, coverage: 'employee-only', description: 'I do not wish to enroll in a dental plan.' },
        { type: 'Dental', name: 'Standard Dental Plan', cost: 25, coverage: 'employee-only', description: 'Includes routine cleanings and basic restorative services.' },
        { type: 'Dental', name: 'Standard Dental Family', cost: 50, coverage: 'family', description: 'Dental coverage for the entire family.' },
        { type: 'Vision', name: 'Waive', cost: 0, coverage: 'employee-only', description: 'I do not wish to enroll in a vision plan.' },
        { type: 'Vision', name: 'Vision Care Plan', cost: 10, coverage: 'employee-only', description: 'Covers annual eye exams and glasses or contacts.' },
        { type: 'Vision', name: 'Vision Care Family', cost: 20, coverage: 'family', description: 'Vision coverage for the entire family.' },
    ];

    return (
        <Modal onClose={onClose}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-primary mb-2">Annual Open Enrollment</h1>
                <p className="text-center text-gray-600 mb-8">Please review your benefit options and make your selections by October 31, 2025.</p>

                <form onSubmit={onSubmit} className="space-y-8">
                    {/* Employee & Dependent Information Section */}
                    <div className="container-card">
                        <h2 className="text-2xl font-bold mb-4">Your Information</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" value={employeeInfo.fullName} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                <input type="text" value={employeeInfo.employeeId} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50" />
                            </div>
                        </div>

                        {/* This section for dependents is simplified for the demo */}
                        <div className="mt-6 form-section">
                            <h3 className="text-xl font-semibold mb-3">Dependents</h3>
                            <p className="text-sm text-gray-500 mb-4">You have {selections.dependents} dependent(s) on file. Please contact HR to make changes.</p>
                        </div>
                    </div>

                    {/* Medical Plans Section */}
                    <div className="container-card">
                        <h2 className="text-2xl font-bold mb-4">Medical Plans</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {planOptions.filter(p => p.type === 'Medical').map(plan => (
                                <div 
                                    key={plan.name}
                                    onClick={() => handleSelectPlan(plan.type, plan.name, plan.cost, plan.coverage)}
                                    className={`plan-card ${selections.plans[plan.type]?.name === plan.name ? 'selected' : ''}`}
                                >
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                                    <span className="text-sm text-gray-500">${plan.cost}/mo</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dental Plans Section */}
                    <div className="container-card">
                        <h2 className="text-2xl font-bold mb-4">Dental Plans</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {planOptions.filter(p => p.type === 'Dental').map(plan => (
                                <div 
                                    key={plan.name}
                                    onClick={() => handleSelectPlan(plan.type, plan.name, plan.cost, plan.coverage)}
                                    className={`plan-card ${selections.plans[plan.type]?.name === plan.name ? 'selected' : ''}`}
                                >
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                                    <span className="text-sm text-gray-500">${plan.cost}/mo</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vision Plans Section */}
                    <div className="container-card">
                        <h2 className="text-2xl font-bold mb-4">Vision Plans</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {planOptions.filter(p => p.type === 'Vision').map(plan => (
                                <div 
                                    key={plan.name}
                                    onClick={() => handleSelectPlan(plan.type, plan.name, plan.cost, plan.coverage)}
                                    className={`plan-card ${selections.plans[plan.type]?.name === plan.name ? 'selected' : ''}`}
                                >
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                                    <span className="text-sm text-gray-500">${plan.cost}/mo</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Cost Summary & Submission */}
                    <div className="container-card">
                        <h2 className="text-2xl font-bold mb-4">Summary & Total Cost</h2>
                        <div className="summary-box">
                            <div id="summary-content" className="mb-4">
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
                            </div>
                            <div className="mt-4 border-t border-gray-300 pt-4 flex justify-between items-center">
                                <div>
                                    <span className="text-lg font-bold block">Estimated Monthly Total:</span>
                                    <span className="text-sm text-gray-500">Estimated Per-Pay-Period Total:</span>
                                </div>
                                <div>
                                    <span id="monthly-total-cost" className="text-2xl font-bold text-green-600 block">${monthlyTotal.toFixed(2)}</span>
                                    <span id="per-pay-period-total-cost" className="text-lg text-gray-600 block text-right">${perPayPeriodTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button type="submit" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-[#1a252f] transition">
                                Submit Enrollment
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default OpenEnrollmentForm;
