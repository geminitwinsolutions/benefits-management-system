// src/pages/AllEmployees.js
import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import OpenEnrollmentForm from '../components/OpenEnrollmentForm';
import { getEmployees, addEmployee, deleteEmployee, updateEmployee, submitEnrollment, getEnrollmentPeriods } from '../services/benefitService';

// Helper to format date for input[type="date"]
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  // Adjust for timezone offset to prevent the date from being off by one day
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + timezoneOffset);
  return adjustedDate.toISOString().split('T')[0];
};

function AllEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [activeEnrollmentPeriodId, setActiveEnrollmentPeriodId] = useState(null);

  async function fetchEmployees() {
    setLoading(true);
    const [fetchedEmployees, enrollmentPeriods] = await Promise.all([
      getEmployees(),
      getEnrollmentPeriods()
    ]);
    const activePeriod = enrollmentPeriods.find(p => p.status === 'Active');
    if (activePeriod) {
      setActiveEnrollmentPeriodId(activePeriod.id);
    }
    setEmployees(fetchedEmployees.sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Send null for empty optional fields that are not required
    const valueToSend = value === '' && name !== 'name' && name !== 'department' && name !== 'status' && name !== 'hire_date' ? null : value;
    setCurrentEmployee(prev => ({ ...prev, [name]: valueToSend }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentEmployee({ 
      name: '', 
      department: '', 
      status: 'Active',
      date_of_birth: null,
      hire_date: new Date().toISOString().split('T')[0], // Default hire date to today
      termination_date: null,
      address: '',
      ssn: '',
      dependents: [] // Default to an empty array
    });
    setShowAddForm(true);
  };
  
  const openEditModal = (employee) => {
    setIsEditing(true);
    setCurrentEmployee(employee);
    setShowAddForm(true);
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
    let updatedEmployee = null;

    if (isEditing) {
      const originalEmployee = employees.find(emp => emp.id === currentEmployee.id);
      updatedEmployee = await updateEmployee(currentEmployee.id, currentEmployee);
      
      if (updatedEmployee) {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp).sort((a, b) => a.name.localeCompare(b.name)));
        if (originalEmployee.status !== 'Active' && updatedEmployee.status === 'Active') {
          triggerEnrollment(updatedEmployee);
        }
      }
    } else {
      updatedEmployee = await addEmployee(currentEmployee);
      if (updatedEmployee) {
        setEmployees(prev => [...prev, updatedEmployee].sort((a,b) => a.name.localeCompare(b.name)));
        triggerEnrollment(updatedEmployee);
      }
    }
    
    setShowAddForm(false);
  };
  
  const triggerEnrollment = (employee) => {
    if (window.confirm(`${employee.name} now qualifies for benefits. Do you want to open a special enrollment period for them?`)) {
      handleStartEnrollment(employee);
    }
  };

  const handleStartEnrollment = (employee) => {
    const employeeWithDetails = { ...employee, fullName: employee.name, employeeId: employee.id };
    setSelectedEmployee(employeeWithDetails);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSubmit = async (enrollmentData) => {
    const dataToSubmit = {
      ...enrollmentData,
      enrollment_period_id: activeEnrollmentPeriodId
    };

    const result = await submitEnrollment(dataToSubmit);
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
        <button className="add-button" onClick={openAddModal}>
          Add New Employee
        </button>
      </div>

      <div className="card">
        <div className="card-body">
            <table className="employees-table">
            <thead>
                <tr>
                  <th>Name</th>
                  <th>Location / Dept #</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((employee) => (
                <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.department}</td>
                    <td>{employee.hire_date}</td>
                    <td>
                      <span className={`status-badge status-${(employee.status || '').toLowerCase().replace(' ', '-')}`}>
                          {employee.status}
                      </span>
                    </td>
                    <td className="action-buttons-cell">
                      <button className="action-button-small" onClick={() => openEditModal(employee)}>
                          Edit
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
            <h3>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form className="add-employee-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={currentEmployee.name || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Location / Department #</label>
                    <input 
                      type="text" 
                      name="department" 
                      value={currentEmployee.department || ''} 
                      onChange={handleInputChange} 
                      placeholder="e.g., 001"
                      required 
                    />
                </div>
                 <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" value={currentEmployee.address || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>SSN</label>
                    <input type="text" name="ssn" value={currentEmployee.ssn || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formatDateForInput(currentEmployee.date_of_birth)} onChange={handleInputChange} />
                </div>
                 <div className="form-group">
                    <label>Hire Date</label>
                    <input type="date" name="hire_date" value={formatDateForInput(currentEmployee.hire_date)} onChange={handleInputChange} required/>
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={currentEmployee.status} onChange={handleInputChange} required>
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Terminated">Terminated</option>
                    </select>
                </div>
                 <div className="form-group">
                    <label>Termination Date</label>
                    <input type="date" name="termination_date" value={formatDateForInput(currentEmployee.termination_date)} onChange={handleInputChange} />
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