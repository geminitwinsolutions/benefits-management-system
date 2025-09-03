import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Modal from '../components/Modal';

const departments = ['Engineering', 'Marketing', 'Sales', 'Operations'];
const statuses = ['Active', 'On Leave', 'Terminated'];

function AllEmployees() {
  const [employees, setEmployees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    getEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('employees')
      .insert([newEmployee])
      .select();

    if (error) {
      console.error('Error adding employee:', error);
    } else {
      setEmployees(prevEmployees => [...prevEmployees, ...data]);
      setShowAddForm(false);
      setNewEmployee({ name: '', department: '', status: '' });
    }
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
          {employees && employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.department}</td>
              <td>
                <span className={`status-badge status-${employee.status.toLowerCase().replace(' ', '-')}`}>
                  {employee.status}
                </span>
              </td>
              <td>
                <button className="action-button">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <h3>Add New Employee</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="name" 
                value={newEmployee.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={newEmployee.department} onChange={handleInputChange} required>
                <option value="" disabled>Select Department</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={newEmployee.status} onChange={handleInputChange} required>
                <option value="" disabled>Select Status</option>
                {statuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <button type="submit" className="submit-button">Save Employee</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AllEmployees;