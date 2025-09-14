import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import OpenEnrollmentForm from '../components/OpenEnrollmentForm';
import { getEmployees, addEmployee, deleteEmployee, updateEmployee, submitEnrollment, getEnrollmentPeriods } from '../services/benefitService';
import SkeletonLoader from '../components/SkeletonLoader';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
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
  const [jobCodes, setJobCodes] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [employeeStatuses, setEmployeeStatuses] = useState([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [
        fetchedEmployees,
        enrollmentPeriods,
        jobCodesRes,
        empTypesRes,
        empStatusesRes,
      ] = await Promise.all([
        getEmployees(),
        getEnrollmentPeriods(),
        supabase.from('job_codes').select('*'),
        supabase.from('employment_types').select('*'),
        supabase.from('employee_statuses').select('*'),
      ]);

      const activePeriod = enrollmentPeriods.find(p => p.status === 'Active');
      if (activePeriod) {
        setActiveEnrollmentPeriodId(activePeriod.id);
      }

      setEmployees(fetchedEmployees.sort((a, b) => a.name.localeCompare(b.name)));
      setJobCodes(jobCodesRes.data || []);
      setEmploymentTypes(empTypesRes.data || []);
      setEmployeeStatuses(empStatusesRes.data || []);

    } catch (error) {
      toast.error("Failed to load employee data and settings.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valueToSet = type === 'checkbox' ? checked : value;
    setCurrentEmployee(prev => ({ ...prev, [name]: valueToSet }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentEmployee({
      name: '',
      department: '',
      status_id: '',
      hire_date: new Date().toISOString().split('T')[0],
      eid: '',
      email: '',
      employment_type_id: '',
      job_code_id: '',
      eligible_for_rehire: true,
    });
    setShowAddForm(true);
  };

  const openEditModal = (employee) => {
    setIsEditing(true);
    setCurrentEmployee(employee);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This will permanently delete the employee.")) {
        const success = await deleteEmployee(currentEmployee.id);
        if (success) {
            toast.success("Employee deleted.");
            setShowAddForm(false);
            fetchData();
        } else {
            toast.error("Failed to delete employee.");
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(isEditing ? 'Updating employee...' : 'Adding employee...');

    try {
      let updatedEmployee = null;
      if (isEditing) {
        updatedEmployee = await updateEmployee(currentEmployee.id, currentEmployee);
      } else {
        updatedEmployee = await addEmployee(currentEmployee);
      }

      if (updatedEmployee) {
        toast.success(`Employee successfully ${isEditing ? 'updated' : 'added'}!`, { id: toastId });
        fetchData();
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setShowAddForm(false);
    }
  };
  
  const handleStartEnrollment = (employee) => {
    const employeeWithDetails = { ...employee, fullName: employee.name, employeeId: employee.id };
    setSelectedEmployee(employeeWithDetails);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentSubmit = async (enrollmentData) => {
    const toastId = toast.loading("Submitting enrollment...");
    try {
      const dataToSubmit = {
        ...enrollmentData,
        enrollment_period_id: activeEnrollmentPeriodId
      };
      const result = await submitEnrollment(dataToSubmit);
      if (result) {
        toast.success(`Enrollment submitted for ${selectedEmployee.name}!`, { id: toastId });
        fetchData();
      } else {
        throw new Error("Submission returned no result.");
      }
    } catch (error) {
      toast.error(`Error submitting enrollment: ${error.message}`, { id: toastId });
    } finally {
      setShowEnrollmentForm(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Employees</h1>
        <button className="add-button" onClick={openAddModal}>Add New Employee</button>
      </div>

      <div className="card">
        <div className="card-body">
            {loading ? <SkeletonLoader type="table" /> : (
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
                          <span className={`status-badge status-${(employee.employee_statuses?.name || 'default').toLowerCase().replace(' ', '-')}`}>
                              {employee.employee_statuses?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="action-buttons-cell">
                          <button className="action-button-small" onClick={() => openEditModal(employee)}>
                              Edit
                          </button>
                          {activeEnrollmentPeriodId && employee.status === 'Active' && (
                            <button className="action-button-small" onClick={() => handleStartEnrollment(employee)}>
                              Enroll
                            </button>
                          )}
                        </td>
                    </tr>
                    ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {showAddForm && currentEmployee && (
        <Modal onClose={() => setShowAddForm(false)}>
            <h3>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form className="add-employee-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={currentEmployee.name || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>EID</label>
                    <input type="text" name="eid" value={currentEmployee.eid || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={currentEmployee.email || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Employment Type</label>
                    <select name="employment_type_id" value={currentEmployee.employment_type_id || ''} onChange={handleInputChange} required>
                        <option value="" disabled>Select a type</option>
                        {employmentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Job Code</label>
                    <select name="job_code_id" value={currentEmployee.job_code_id || ''} onChange={handleInputChange} required>
                        <option value="" disabled>Select a code</option>
                        {jobCodes.map(code => <option key={code.id} value={code.id}>{code.code} - {code.description}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Location / Department #</label>
                    <input type="text" name="department" value={currentEmployee.department || ''} onChange={handleInputChange} required />
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
                    <select name="status_id" value={currentEmployee.status_id || ''} onChange={handleInputChange} required>
                        <option value="" disabled>Select a status</option>
                        {employeeStatuses.map(status => <option key={status.id} value={status.id}>{status.name}</option>)}
                    </select>
                </div>
                 <div className="form-group">
                    <label>Termination Date</label>
                    <input type="date" name="termination_date" value={formatDateForInput(currentEmployee.termination_date)} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" name="eligible_for_rehire" checked={!!currentEmployee.eligible_for_rehire} onChange={handleInputChange} />
                        Eligible for Rehire
                    </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <button type="submit" className="submit-button">Save Employee</button>
                    {isEditing && (
                        <button type="button" className="action-button-delete" onClick={handleDelete}>
                            Delete Employee
                        </button>
                    )}
                </div>
            </form>
        </Modal>
      )}

      {showEnrollmentForm && selectedEmployee && (
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