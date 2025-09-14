// src/pages/UserSettings.js
import React, { useState, useEffect, useCallback } from 'react';
import { getUsersWithRoles, getRoles, inviteUser, updateUserRole, getEmployees, getUsers } from '../services/benefitService';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

function UserSettings() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employeesWithoutUsers, setEmployeesWithoutUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [inviteType, setInviteType] = useState('external');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, allEmployees, allUsers] = await Promise.all([
                getUsersWithRoles(),
                getRoles(),
                getEmployees(),
                getUsers()
            ]);

            const userEmails = new Set(allUsers.map(u => u.email));
            const employeesToInvite = allEmployees.filter(emp => emp.email && !userEmails.has(emp.email));

            setUsers(usersData);
            setRoles(rolesData);
            setEmployeesWithoutUsers(employeesToInvite);
        } catch (error) {
            toast.error("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (user = null) => {
        setIsEditing(!!user);
        if (user) {
            setCurrentUser(user);
            setInviteType('external'); 
        } else {
            setCurrentUser({ email: '', full_name: '', role: { id: '' } });
            setInviteType('external');
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentUser(null);
    };
    
    // Reset form when invite type changes
    useEffect(() => {
        if (!isEditing && showForm) {
            setCurrentUser({ email: '', full_name: '', role: { id: '' } });
        }
    }, [inviteType, isEditing, showForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'role_id') {
            setCurrentUser(prev => ({ ...prev, role: { ...prev.role, id: value } }));
        } else {
            setCurrentUser(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEmployeeSelect = (e) => {
        const employeeId = e.target.value;
        const selectedEmployee = employeesWithoutUsers.find(emp => emp.id.toString() === employeeId);
        if (selectedEmployee) {
            setCurrentUser(prev => ({
                ...prev,
                full_name: selectedEmployee.name,
                email: selectedEmployee.email
            }));
        } else {
             setCurrentUser(prev => ({
                ...prev,
                full_name: '',
                email: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(isEditing ? 'Updating user...' : 'Sending invitation...');
        try {
            if (isEditing) {
                await updateUserRole(currentUser.id, currentUser.role.id);
            } else {
                await inviteUser({
                    email: currentUser.email,
                    fullName: currentUser.full_name,
                    roleId: currentUser.role.id,
                });
            }
            toast.success(`User successfully ${isEditing ? 'updated' : 'invited'}!`, { id: toastId });
            fetchData();
            handleCloseForm();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    if (loading) {
        return <SkeletonLoader type="table" />;
    }

    return (
        <div>
            <div className="page-header">
                <h1>User Management</h1>
                <button className="add-button" onClick={() => handleOpenForm()}>
                    Invite New User
                </button>
            </div>
            <p>Invite, remove, and manage roles for users in your organization.</p>
            <div className="card">
                <div className="card-header violet"><h2>Current Users</h2></div>
                <div className="card-body">
                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.full_name || 'N/A'}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className="status-badge status-active">{user.role?.name || 'No Role'}</span>
                                    </td>
                                    <td>
                                        <button className="action-button-small" onClick={() => handleOpenForm(user)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && currentUser && (
                <Modal onClose={handleCloseForm}>
                    <h3>{isEditing ? 'Edit User' : 'Invite New User'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                        {!isEditing && (
                            <div className="form-group">
                                <label>Invite Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label>
                                        <input type="radio" value="external" checked={inviteType === 'external'} onChange={() => setInviteType('external')} />
                                        External User
                                    </label>
                                    <label>
                                        <input type="radio" value="employee" checked={inviteType === 'employee'} onChange={() => setInviteType('employee')} />
                                        Existing Employee
                                    </label>
                                </div>
                            </div>
                        )}

                        {!isEditing && inviteType === 'employee' && (
                            <div className="form-group">
                                <label>Select Employee</label>
                                <select onChange={handleEmployeeSelect} defaultValue="" required>
                                    <option value="" disabled>Choose an employee</option>
                                    {employeesWithoutUsers.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                name="full_name" 
                                value={currentUser.full_name || ''} 
                                onChange={handleInputChange} 
                                required 
                                disabled={isEditing || inviteType === 'employee'}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={currentUser.email || ''} 
                                onChange={handleInputChange} 
                                required 
                                disabled={isEditing || inviteType === 'employee'}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role_id" value={currentUser.role?.id || ''} onChange={handleInputChange} required>
                                <option value="" disabled>Select a role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="submit-button">{isEditing ? 'Save Changes' : 'Send Invitation'}</button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default UserSettings;