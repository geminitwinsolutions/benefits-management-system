import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
// --- ADDED THIS IMPORT ---
import OpenEnrollmentForm from '../components/OpenEnrollmentForm'; 
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// ... (all your chart data constants remain the same) ...

function AllEmployees() {
  const [employees, setEmployees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', status: '' });

  // --- MOVED THESE HOOKS TO THE TOP LEVEL ---
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  async function getEmployees() {
    // ... (function remains the same)
  }

  useEffect(() => {
    getEmployees();
  }, []);

  const handleInputChange = (e) => {
    // ... (function remains the same)
  };
  
  const handleDelete = async (id) => {
    // ... (function remains the same)
  };

  const handleSubmit = async (e) => {
    // ... (function remains the same)
  };
  
  const handleStartEnrollment = (employee) => {
    const employeeWithDetails = {
      ...employee,
      dependents: [], // This can be replaced with real data later
      fullName: employee.name,
      employeeId: employee.id,
    };
    setSelectedEmployee(employeeWithDetails);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSubmit = (selections) => {
    console.log("Enrollment selections to be saved:", selections);
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

      <div className="employees-analytics-layout">
        {/* Left: Employees Table */}
        <div className="employees-table-col card">
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
                  <td className="action-buttons-cell">
                    <button
                      className="action-button-small"
                      onClick={() => handleStartEnrollment(employee)}
                    >
                      Enroll
                    </button>
                    <button
                      className="action-button-delete"
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

        {/* Right: Analytics Cards */}
        <div className="analytics-cards-col">
          {/* ... your analytics cards JSX ... */}
        </div>
      </div>

      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          {/* ... your add employee form JSX ... */}
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