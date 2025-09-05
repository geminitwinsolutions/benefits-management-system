// src/pages/PlanManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
    getCarriers, addCarrier, updateCarrier, deleteCarrier,
    getBenefitPlans, addBenefitPlan, updateBenefitPlan, deleteBenefitPlan 
} from '../services/benefitService';
import Modal from '../components/Modal';

// --- Carrier Management Component ---
const CarrierManager = ({ carriers, onUpdate }) => {
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
                <button className="add-button action-button-small" onClick={() => handleOpenForm()}>Add Carrier</button>
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
                                    <button className="action-button-small" onClick={() => handleOpenForm(carrier)}>Edit</button>
                                    <button className="action-button-delete action-button-small" onClick={() => handleDelete(carrier.id)}>Delete</button>
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
                            <input type="text" value={currentCarrier.name} onChange={(e) => setCurrentCarrier({...currentCarrier, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Contact Info</label>
                            <input type="text" value={currentCarrier.contact_info} onChange={(e) => setCurrentCarrier({...currentCarrier, contact_info: e.target.value})} />
                        </div>
                        <button type="submit" className="submit-button">Save</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// --- Benefit Plan Management Component ---
const PlanManager = ({ plans, carriers, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);

    const handleOpenForm = (plan = null) => {
        setIsEditing(!!plan);
        setCurrentPlan(plan || { plan_name: '', plan_type: 'Medical', cost: 0, description: '', carrier_id: carriers[0]?.id || '' });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentPlan(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateBenefitPlan(currentPlan.id, currentPlan);
        } else {
            await addBenefitPlan(currentPlan);
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
                <button className="add-button action-button-small" onClick={() => handleOpenForm()}>Add Plan</button>
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
                                    <button className="action-button-small" onClick={() => handleOpenForm(plan)}>Edit</button>
                                    <button className="action-button-delete action-button-small" onClick={() => handleDelete(plan.id)}>Delete</button>
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
                            <input type="text" value={currentPlan.plan_name} onChange={(e) => setCurrentPlan({...currentPlan, plan_name: e.target.value})} required />
                        </div>
                         <div className="form-group">
                            <label>Plan Type</label>
                            <select value={currentPlan.plan_type} onChange={(e) => setCurrentPlan({...currentPlan, plan_type: e.target.value})}>
                                <option>Medical</option>
                                <option>Dental</option>
                                <option>Vision</option>
                                <option>Life</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Carrier</label>
                            <select value={currentPlan.carrier_id} onChange={(e) => setCurrentPlan({...currentPlan, carrier_id: e.target.value})} required>
                                <option value="" disabled>Select a carrier</option>
                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Monthly Cost</label>
                            <input type="number" step="0.01" value={currentPlan.cost} onChange={(e) => setCurrentPlan({...currentPlan, cost: parseFloat(e.target.value)})} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={currentPlan.description} onChange={(e) => setCurrentPlan({...currentPlan, description: e.target.value})} />
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

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [carrierData, planData] = await Promise.all([getCarriers(), getBenefitPlans()]);
        setCarriers(carrierData);
        setPlans(planData);
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
            <p>Manage insurance carriers and the benefit plans they offer.</p>
            <div className="plan-management-layout">
                <CarrierManager carriers={carriers} onUpdate={fetchData} />
                <PlanManager plans={plans} carriers={carriers} onUpdate={fetchData} />
            </div>
        </div>
    );
}

export default PlanManagement;