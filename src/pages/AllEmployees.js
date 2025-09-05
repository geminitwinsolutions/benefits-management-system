// src/pages/AllEmployees.js
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import OpenEnrollmentForm from '../components/OpenEnrollmentForm';
import { getEmployees, addEmployee, deleteEmployee, submitEnrollment } from '../services/benefitService';

function AllEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', status: 'Active' });

  // FIX: These state declarations were missing or out of scope
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  async function fetchEmployees() {
    setLoading(true);
    const fetchedEmployees = await getEmployees();
    setEmployees(fetchedEmployees);
    setLoading(false);
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee? This could affect historical records.")) {
        const success = await deleteEmployee(id);
        if (success) {
            setEmployees(prev => prev.filter(emp => emp.id !== id));
        } else {
            alert("Failed to delete employee.");
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const added = await addEmployee(newEmployee);
    if (added) {
      setEmployees(prev => [...prev, added].sort((a,b) => a.name.localeCompare(b.name)));
      setShowAddForm(false);
      setNewEmployee({ name: '', department: '', status: 'Active' });
    } else {
      alert("Failed to add employee.");
    }
  };
  
  const handleStartEnrollment = (employee) => {
    const employeeWithDetails = {
      ...employee,
      fullName: employee.name,
      employeeId: employee.id,
    };
    setSelectedEmployee(employeeWithDetails);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSubmit = async (enrollmentData) => {
    const result = await submitEnrollment(enrollmentData);
    if (result) {
      alert(`Successfully submitted enrollment for ${selectedEmployee.name}!`);
    } else {
      alert(`There was an error submitting the enrollment. Please try again.`);
    }
    setShowEnrollmentForm(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Employees...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Employees</h1>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          Add New Employee
        </button>
      </div>

      <div className="card">
        <div className="card-body">
            <table className="employees-table">
            <thead>
                <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((employee) => (
                <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.department}</td>
                    <td>
                    <span className={`status-badge status-${employee.status.toLowerCase().replace(' ', '-')}`}>
                        {employee.status}
                    </span>
                    </td>
                    <td className="action-buttons-cell">
                    <button
                        className="action-button-small"
                        onClick={() => handleStartEnrollment(employee)}
                    >
                        Enroll
                    </button>
                    <button
                        className="action-button-delete action-button-small"
                        onClick={() => handleDelete(employee.id)}
                        aria-label={`Delete ${employee.name}`}
                    >
                        Delete
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
            <h3>Add New Employee</h3>
            <form className="add-employee-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={newEmployee.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" value={newEmployee.department} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={newEmployee.status} onChange={handleInputChange} required>
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                    </select>
                </div>
                <button type="submit" className="submit-button">Save Employee</button>
            </form>
        </Modal>
      )}

      {showEnrollmentForm && (
        <OpenEnrollmentForm 
          employeeInfo={selectedEmployee}
          onClose={() => setShowEnrollmentForm(false)}
          onSubmit={handleEnrollmentSubmit}
        />
      )}
    </div>
  );
}

export default AllEmployees;