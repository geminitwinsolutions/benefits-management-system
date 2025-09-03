import React, { useState, useEffect } from 'react';
import { getServices, addService, deleteService } from '../services/benefitService';
import Modal from '../components/Modal';

function ServiceLibrary() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
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
        const { name, value, type, checked } = e.target;
        setNewService(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const addedService = await addService(newService);
        if (addedService) {
            setServices(prevServices => [...prevServices, addedService]);
            setShowForm(false);
            setNewService({ name: '', description: '', category: '', price: '' });
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            const success = await deleteService(id);
            if (success) {
                setServices(prevServices => prevServices.filter(service => service.id !== id));
            }
        }
    };

    if (loading) {
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
                            <td>
                                <button className="action-button" onClick={() => handleDelete(service.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showForm && (
                <Modal onClose={() => setShowForm(false)}>
                    <h3>Add New Service</h3>
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
                </Modal>
            )}
        </div>
    );
}

export default ServiceLibrary;
