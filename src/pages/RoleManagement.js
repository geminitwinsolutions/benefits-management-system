// src/pages/RoleManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { getRoles, addRole, updateRole, deleteRole, updateRolePermissions } from '../services/benefitService';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const allPermissions = [
    { id: 'admin', label: 'Full Admin Access' },
    { id: 'employees:write', label: 'Manage Employees' },
    { id: 'employees:read', label: 'View Employees' },
    { id: 'clients:write', label: 'Manage Clients' },
    { id: 'clients:read', label: 'View Clients' },
    { id: 'enrollment:write', label: 'Manage Enrollment' },
    { id: 'reconciliation:write', label: 'Manage Reconciliation' },
    { id: 'reports:write', label: 'Manage Reports' },
    { id: 'reports:read', label: 'View Reports' },
];

function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [currentPermissions, setCurrentPermissions] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const rolesData = await getRoles();
        setRoles(rolesData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (role = null) => {
        setIsEditing(!!role);
        setCurrentRole(role || { name: '' });
        setCurrentPermissions(role ? role.role_permissions.map(p => p.permission) : []);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentRole(null);
        setCurrentPermissions([]);
    };

    const handlePermissionChange = (permissionId) => {
        setCurrentPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(isEditing ? 'Updating role...' : 'Adding role...');

        try {
            let roleResponse;
            if (isEditing) {
                roleResponse = await updateRole(currentRole.id, { name: currentRole.name });
            } else {
                roleResponse = await addRole({ name: currentRole.name });
            }

            await updateRolePermissions(roleResponse.id, currentPermissions);
            
            toast.success(`Role successfully ${isEditing ? 'updated' : 'added'}!`, { id: toastId });
            fetchData();
            handleCloseForm();
        } catch (error) {
            toast.error(`Failed to save role: ${error.message}`, { id: toastId });
        }
    };

    const handleDelete = async (roleId) => {
        if (window.confirm("Are you sure? This will delete the role and unassign all users from it.")) {
            const toastId = toast.loading('Deleting role...');
            try {
                await deleteRole(roleId);
                toast.success('Role deleted!', { id: toastId });
                fetchData();
                handleCloseForm();
            } catch (error) {
                toast.error(`Failed to delete role: ${error.message}`, { id: toastId });
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Role Management</h1>
                <button className="add-button" onClick={() => handleOpenForm()}>Add New Role</button>
            </div>
            <p>Define roles and their permissions for users in the system.</p>
            <div className="card">
                <div className="card-header violet"><h2>All Roles</h2></div>
                <div className="card-body">
                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Permissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td>{role.name}</td>
                                    <td>{role.role_permissions.map(p => p.permission).join(', ')}</td>
                                    <td>
                                        <button className="action-button-small" onClick={() => handleOpenForm(role)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <Modal onClose={handleCloseForm}>
                    <h3>{isEditing ? 'Edit Role' : 'Add New Role'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Role Name</label>
                            <input
                                type="text"
                                value={currentRole.name}
                                onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Permissions</label>
                            <div className="permissions-grid">
                                {allPermissions.map(p => (
                                    <label key={p.id}>
                                        <input
                                            type="checkbox"
                                            checked={currentPermissions.includes(p.id)}
                                            onChange={() => handlePermissionChange(p.id)}
                                        />
                                        {p.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <button type="submit" className="submit-button">Save Role</button>
                            {isEditing && (
                                <button type="button" className="action-button-delete" onClick={() => handleDelete(currentRole.id)}>Delete Role</button>
                            )}
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default RoleManagement;