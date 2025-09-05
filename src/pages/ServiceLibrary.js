// src/pages/ServiceLibrary.js
import React, { useState, useEffect } from 'react';
import { getServices, addService, updateService, deleteService } from '../services/benefitService';
import Modal from '../components/Modal';

function ServiceLibrary() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [newService, setNewService] = useState({ name: '', description: '', category: '', price: '' });

    useEffect(() => {
        async function fetchServices() {
            const fetchedServices = await getServices();
            setServices(fetchedServices);
            setLoading(false);
        }
        fetchServices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService(prev => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (service) => {
        setEditingService(service);
        setNewService({
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (editingService) {
            const updated = await updateService(editingService.id, newService);
            if (updated) {
                setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
            }
        } else {
            const added = await addService(newService);
            if (added) {
                setServices(prev => [...prev, added]);
            }
        }

        handleCloseModal();
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            const success = await deleteService(id);
            if (success) {
                setServices(prev => prev.filter(service => service.id !== id));
            } else {
                alert("Failed to delete the service.");
            }
        }
    };

    const handleCloseModal = () => {
        setShowForm(false);
        setEditingService(null);
        setNewService({ name: '', description: '', category: '', price: '' });
    };

    if (loading && !showForm) {
        return (
            <div className="page-container">
                <h1>Loading Services...</h1>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Service & Fee Library</h1>
                <button className="add-button" onClick={() => setShowForm(true)}>
                    Add New Service
                </button>
            </div>
            
            <p>Manage all available services and their a la carte fees.</p>

            <div className="card">
                <div className="card-header blue">
                    <h2>Service List</h2>
                </div>
                <div className="card-body">
                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>
                                        <strong className="block">{service.name}</strong>
                                        <span className="text-sm text-gray-500">{service.description}</span>
                                    </td>
                                    <td>{service.category}</td>
                                    <td>${service.price}</td>
                                    <td className="action-buttons-cell">
                                        <button className="action-button-small" onClick={() => handleEditClick(service)}>Edit</button>
                                        <button className="action-button-delete action-button-small" onClick={() => handleDelete(service.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <Modal onClose={handleCloseModal}>
                    <div className="card-header">
                        <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                    </div>
                    <div className="card-body">
                        <form className="add-employee-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Service Name</label>
                                <input type="text" name="name" value={newService.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={newService.description} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input type="text" name="category" value={newService.category} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input type="number" name="price" value={newService.price} onChange={handleInputChange} required />
                            </div>
                            <button type="submit" className="submit-button">Save Service</button>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default ServiceLibrary;