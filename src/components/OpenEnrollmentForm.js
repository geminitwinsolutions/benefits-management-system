import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../components/Modal';
import { getPlansForEnrollmentPeriod } from '../services/benefitService';
import toast from 'react-hot-toast'; // Import toast

// Helper functions (calculateAge, getAgeBasedRate) are unchanged

function OpenEnrollmentForm({ employeeInfo, onClose, onSubmit, periodId, isPreview = false }) {
    const [selections, setSelections] = useState({ plans: {} });
    const [benefitPlans, setBenefitPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlans() {
            if (!periodId) { // Changed from activePeriodId
                console.error("No enrollment period ID provided.");
                setLoading(false);
                return;
            }
            setLoading(true);
            const plans = await getPlansForEnrollmentPeriod(periodId); // Changed from activePeriodId
            setBenefitPlans(plans);
            setLoading(false);
        }
        fetchPlans();
    }, [periodId]); // Changed from activePeriodId

    // ... (useMemo hooks for employeeAge and organizedPlans are unchanged)

    // ... (handleSelectPlan and handleSelectLifeCoverage are unchanged)

    const calculateTotals = () => { /* ... (unchanged) ... */ };
    const { monthlyTotal, perPayPeriodTotal } = calculateTotals();

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // If in preview mode, just call the onSubmit (which shows a toast)
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

    if (loading) { /* ... (unchanged) ... */ }
    
    return (
        <Modal onClose={onClose} size="large">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-2">Annual Open Enrollment {isPreview && '(Preview)'}</h1>
                {/* ... (rest of the form is mostly unchanged) ... */}
                <form onSubmit={handleFormSubmit} className="space-y-8">
                    {/* ... (Your Information card) ... */}
                    {/* ... (Plan selection cards) ... */}
                    
                    <div className="card">
                        {/* ... (Summary & Total Cost card header) ... */}
                        <div className="card-body">
                            {/* ... (summary-box) ... */}
                            <div className="mt-6 text-center">
                                {/* MODIFIED BUTTON */}
                                <button type="submit" className="submit-button" disabled={isPreview}>
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