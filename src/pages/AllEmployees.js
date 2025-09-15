import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import OpenEnrollmentForm from '../components/OpenEnrollmentForm';
import { getEmployees, addEmployee, deleteEmployee, updateEmployee, submitEnrollment, getEnrollmentPeriods } from '../services/benefitService';
import SkeletonLoader from '../components/SkeletonLoader';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { usStates } from '../utils/constants';

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
  const [isSsnVisible, setIsSsnVisible] = useState(false);

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

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const formatSsn = (value) => {
    if (!value) return '';
    const ssn = value.replace(/[^\d]/g, '');
    const ssnLength = ssn.length;
    if (ssnLength < 4) return ssn;
    if (ssnLength < 6) {
      return `${ssn.slice(0, 3)}-${ssn.slice(3)}`;
    }
    return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5, 9)}`;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let valueToSet = type === 'checkbox' ? checked : value;

    // Ensure that foreign key IDs are correctly handled as numbers
    if (['status_id', 'employment_type_id', 'job_code_id'].includes(name)) {
      valueToSet = parseInt(value, 10);
    }

    if (name === 'phone_number') {
      valueToSet = formatPhoneNumber(value);
    }
    if (name === 'ssn') {
      valueToSet = formatSsn(value);
    }

    setCurrentEmployee(prev => ({ ...prev, [name]: valueToSet }));
  };

  // src/pages/AllEmployees.js
  const openAddModal = () => {
    setIsEditing(false);
    setIsSsnVisible(true);
    // This is the updated part that sets default values for the dropdowns
    setCurrentEmployee({
      name: '',
      department: '',
      status_id: employeeStatuses.length > 0 ? employeeStatuses[0].id : '',
      hire_date: new Date().toISOString().split('T')[0],
      eid: '',
      email: '',
      phone_number: '',
      employment_type_id: employmentTypes.length > 0 ? employmentTypes[0].id : '',
      job_code_id: jobCodes.length > 0 ? jobCodes[0].id : '',
      eligible_for_rehire: true,
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      zip_code: '',
      ssn: '',
    });
    setShowAddForm(true);
  };

  const openEditModal = (employee) => {
    setIsEditing(true);
    setIsSsnVisible(false);
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
        setShowAddForm(false);
      } else {
        throw new Error('Operation failed to return the employee.');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
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
        <div className="card-header violet">
          <h2>Employee Roster</h2>
        </div>
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
                      <span className={`status-badge status-${(employee.status || 'default').toLowerCase().replace(/ /g, '-')}`}>
                        {employee.status || 'N/A'}
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
        <Modal onClose={() => setShowAddForm(false)} size="large">
          <h3>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="employee-form-grid">
              {/* --- Personal Information --- */}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="e.g., Jane Doe" value={currentEmployee.name || ''} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>EID</label>
                <input type="text" name="eid" placeholder="e.g., 12345" value={currentEmployee.eid || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="e.g., jane.doe@example.com" value={currentEmployee.email || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone_number" placeholder="(XXX) XXX-XXXX" value={currentEmployee.phone_number || ''} onChange={handleInputChange} maxLength="14" />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="date_of_birth" value={formatDateForInput(currentEmployee.date_of_birth)} onChange={handleInputChange} />
              </div>
              <div className="form-group ssn-group">
                <label>SSN</label>
                <div className="ssn-input-wrapper">
                  <input
                    type={isSsnVisible ? 'text' : 'password'}
                    name="ssn"
                    value={isSsnVisible ? (currentEmployee.ssn || '') : (currentEmployee.ssn ? `***-**-${currentEmployee.ssn.slice(-4)}` : '')}
                    onChange={handleInputChange}
                    maxLength="11"
                    placeholder="XXX-XX-XXXX"
                  />
                  <button type="button" onClick={() => setIsSsnVisible(!isSsnVisible)} className="action-button-small">
                    {isSsnVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* --- Address Information --- */}
              <div className="form-group">
                <label>Address 1</label>
                <input type="text" name="address_1" placeholder="e.g., 123 Main St" value={currentEmployee.address_1 || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Address 2</label>
                <input type="text" name="address_2" placeholder="Apt, Suite, etc." value={currentEmployee.address_2 || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" placeholder="e.g., Anytown" value={currentEmployee.city || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>State</label>
                <select name="state" value={currentEmployee.state || ''} onChange={handleInputChange}>
                  <option value="" disabled>Select a State</option>
                  {usStates.map(s => <option key={s.abbreviation} value={s.name}>{`${s.name} (${s.abbreviation})`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="zip_code" placeholder="e.g., 12345" value={currentEmployee.zip_code || ''} onChange={handleInputChange} />
              </div>

              {/* --- Employment Information --- */}
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
                <input type="text" name="department" placeholder="e.g., 100" value={currentEmployee.department || ''} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Hire Date</label>
                <input type="date" name="hire_date" value={formatDateForInput(currentEmployee.hire_date)} onChange={handleInputChange} required />
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
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
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