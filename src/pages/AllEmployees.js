// src/pages/AllEmployees.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import OpenEnrollmentForm from '../components/OpenEnrollmentForm';
// --- CORRECTED IMPORT STATEMENT ---
import { getEmployees, addEmployee, deleteEmployee, submitEnrollment } from '../services/benefitService';

// ... (rest of the component)

// --- UPDATE THE SUBMIT HANDLER TO USE THE CORRECT FUNCTION ---
  const handleEnrollmentSubmit = async (enrollmentData) => {
    const result = await submitEnrollment(enrollmentData);
    if (result) {
      alert(`Successfully submitted enrollment for ${selectedEmployee.name}!`);
    } else {
      alert(`There was an error submitting the enrollment for ${selectedEmployee.name}. Please try again.`);
    }
    setShowEnrollmentForm(false);
  };

function AllEmployees() {
  const [employees, setEmployees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', status: '' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  // ... (getEmployees, handleInputChange, handleDelete, handleSubmit functions remain the same)

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
      // Optionally, you could refresh employee data here to show an updated status
    } else {
      alert(`There was an error submitting the enrollment for ${selectedEmployee.name}. Please try again.`);
    }
    setShowEnrollmentForm(false);
  };

  // ... (rest of the component remains the same)
}

export default AllEmployees;