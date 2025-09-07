import React, { useState, useEffect, useCallback } from 'react';
import {
    getCarriers, addCarrier, updateCarrier, deleteCarrier,
    getBenefitPlans, addBenefitPlan, updateBenefitPlan, deleteBenefitPlan,
    getEnrollmentPeriods
} from '../services/benefitService';
import Modal from '../components/Modal';

// --- Carrier Management Component ---
const CarrierManager = ({ carriers, onUpdate, isEnrollmentActive }) => {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCarrier, setCurrentCarrier] = useState(null);

    const handleOpenForm = (carrier = null) => {
        setIsEditing(!!carrier);
        setCurrentCarrier(carrier || { name: '', contact_info: '' });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentCarrier(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateCarrier(currentCarrier.id, currentCarrier);
        } else {
            await addCarrier(currentCarrier);
        }
        onUpdate(); // Re-fetch all data
        handleCloseForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carrier? This may affect associated benefit plans.')) {
            await deleteCarrier(id);
            onUpdate();
        }
    };

    return (
        <div className="card">
            <div className="page-header">
                <h2>Carriers</h2>
                <button 
                  className="add-button action-button-small" 
                  onClick={() => handleOpenForm()} 
                  disabled={!isEnrollmentActive}>
                    Add Carrier
                </button>
            </div>
            <div className="card-body">
                <table className="employees-table">
                    <thead><tr><th>Name</th><th>Contact</th><th>Actions</th></tr></thead>
                    <tbody>
                        {carriers.map(carrier => (
                            <tr key={carrier.id}>
                                <td>{carrier.name}</td>
                                <td>{carrier.contact_info}</td>
                                <td className="action-buttons-cell">
                                    <button 
                                      className="action-button-small" 
                                      onClick={() => handleOpenForm(carrier)} 
                                      disabled={!isEnrollmentActive}>
                                        Edit
                                    </button>
                                    <button 
                                      className="action-button-delete action-button-small" 
                                      onClick={() => handleDelete(carrier.id)}
                                      disabled={!isEnrollmentActive}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showForm && (
                <Modal onClose={handleCloseForm}>
                    <h3>{isEditing ? 'Edit Carrier' : 'Add Carrier'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Carrier Name</label>
                            <input type="text" value={currentCarrier?.name || ''} onChange={(e) => setCurrentCarrier({...currentCarrier, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Contact Info</label>
                            <input type="text" value={currentCarrier?.contact_info || ''} onChange={(e) => setCurrentCarrier({...currentCarrier, contact_info: e.target.value})} />
                        </div>
                        <button type="submit" className="submit-button">Save</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// --- Benefit Plan Management Component ---
const PlanManager = ({ plans, carriers, onUpdate, isEnrollmentActive }) => {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);

    const handleOpenForm = (plan = null) => {
        setIsEditing(!!plan);
        setCurrentPlan(plan || { 
            plan_name: '', 
            plan_type: 'Medical', 
            carrier_rate: 0, 
            client_margin: 0, 
            description: '', 
            carrier_id: carriers[0]?.id || '' 
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentPlan(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalCost = currentPlan.carrier_rate + (currentPlan.carrier_rate * (currentPlan.client_margin / 100));

        const planToSave = {
            ...currentPlan,
            cost: finalCost,
        };

        if (isEditing) {
            await updateBenefitPlan(planToSave.id, planToSave);
        } else {
            await addBenefitPlan(planToSave);
        }

        onUpdate();
        handleCloseForm();
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit plan?')) {
            await deleteBenefitPlan(id);
            onUpdate();
        }
    };

    return (
        <div className="card">
            <div className="page-header">
                <h2>Benefit Plans</h2>
                <button 
                  className="add-button action-button-small" 
                  onClick={() => handleOpenForm()} 
                  disabled={!isEnrollmentActive}>
                    Add Plan
                </button>
            </div>
            <div className="card-body">
                <table className="employees-table">
                     <thead><tr><th>Plan Name</th><th>Type</th><th>Carrier</th><th>Cost</th><th>Actions</th></tr></thead>
                    <tbody>
                        {plans.map(plan => (
                            <tr key={plan.id}>
                                <td>{plan.plan_name}</td>
                                <td>{plan.plan_type}</td>
                                <td>{carriers.find(c => c.id === plan.carrier_id)?.name || 'N/A'}</td>
                                <td>${plan.cost}</td>
                                <td className="action-buttons-cell">
                                    <button 
                                      className="action-button-small" 
                                      onClick={() => handleOpenForm(plan)}
                                      disabled={!isEnrollmentActive}>
                                        Edit
                                    </button>
                                    <button 
                                      className="action-button-delete action-button-small" 
                                      onClick={() => handleDelete(plan.id)}
                                      disabled={!isEnrollmentActive}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {showForm && (
                <Modal onClose={handleCloseForm}>
                    <h3>{isEditing ? 'Edit Benefit Plan' : 'Add Benefit Plan'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                         <div className="form-group">
                            <label>Plan Name</label>
                            <input type="text" value={currentPlan?.plan_name || ''} onChange={(e) => setCurrentPlan({ ...currentPlan, plan_name: e.target.value })} required />
                        </div>
                         <div className="form-group">
                            <label>Plan Type</label>
                            <select value={currentPlan?.plan_type || ''} onChange={(e) => setCurrentPlan({ ...currentPlan, plan_type: e.target.value })}>
                                <option>Medical</option>
                                <option>Dental</option>
                                <option>Vision</option>
                                <option>Life</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Carrier</label>
                            <select value={currentPlan?.carrier_id || ''} onChange={(e) => setCurrentPlan({ ...currentPlan, carrier_id: e.target.value })} required>
                                <option value="" disabled>Select a carrier</option>
                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Carrier's Monthly Rate</label>
                            <input type="number" step="0.01" value={currentPlan?.carrier_rate || 0} onChange={(e) => setCurrentPlan({ ...currentPlan, carrier_rate: parseFloat(e.target.value) })} required />
                        </div>
                        <div className="form-group">
                            <label>Client Margin (%)</label>
                            <input type="number" step="0.01" value={currentPlan?.client_margin || 0} onChange={(e) => setCurrentPlan({ ...currentPlan, client_margin: parseFloat(e.target.value) })} required />
                        </div>
                        <div className="form-group">
                            <label>Employee Monthly Cost</label>
                            {/* Display the calculated cost here */}
                            <input type="text" value={ (currentPlan?.carrier_rate + (currentPlan?.carrier_rate * (currentPlan?.client_margin / 100)))?.toFixed(2) || 0} readOnly />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={currentPlan?.description || ''} onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })} />
                        </div>
                        <button type="submit" className="submit-button">Save</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// --- Main Page Component ---
function PlanManagement() {
    const [carriers, setCarriers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEnrollmentActive, setIsEnrollmentActive] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [carrierData, planData, enrollmentPeriods] = await Promise.all([getCarriers(), getBenefitPlans(), getEnrollmentPeriods()]);
        
        setCarriers(carrierData);
        setPlans(planData);
        
        // Check if there is an active enrollment period
        const activePeriod = enrollmentPeriods.find(p => p.status === 'Active');
        setIsEnrollmentActive(!!activePeriod);
        
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="page-container"><h1>Loading...</h1></div>;
    }
    
    return (
        <div>
            <h2>Plan & Carrier Management</h2>
            <p>
                Manage insurance carriers and the benefit plans they offer. This section is only editable 
                when an **Open Enrollment** period is active.
            </p>
            {!isEnrollmentActive && (
              <div className="mt-4 p-4 text-center text-orange-700 bg-orange-100 border-l-4 border-orange-500">
                <p className="font-bold">Plan management is locked.</p>
                <p>Please activate an Open Enrollment period to add or edit plans and carriers.</p>
              </div>
            )}
            <div className="plan-management-layout">
                <CarrierManager carriers={carriers} onUpdate={fetchData} isEnrollmentActive={isEnrollmentActive} />
                <PlanManager plans={plans} carriers={carriers} onUpdate={fetchData} isEnrollmentActive={isEnrollmentActive} />
            </div>
        </div>
    );
}

export default PlanManagement;
