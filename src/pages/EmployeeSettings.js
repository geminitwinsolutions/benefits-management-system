import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { payTypes, flsaTypes, eeocCategories, workersCompCodes } from '../utils/constants';

// Generic manager component for Job Codes and Employment Types
const SettingManager = ({ title, tableName, columns, items, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const handleOpenForm = (item = null) => {
    setIsEditing(!!item);
    if (item) {
        setCurrentItem(item);
    } else {
        // Set default values for new items
        const newItem = {};
        columns.forEach(col => {
            // Set initial values for the form fields
            switch(col.key) {
                case 'pay_type':
                    newItem[col.key] = payTypes[0];
                    break;
                case 'flsa_type':
                    newItem[col.key] = flsaTypes[0];
                    break;
                case 'eeoc_id':
                    newItem[col.key] = `${eeocCategories[0].code} - ${eeocCategories[0].name}`;
                    break;
                default:
                    newItem[col.key] = '';
            }
        });
        setCurrentItem(newItem);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(`${isEditing ? 'Updating' : 'Adding'} item...`);

    try {
      let error;
      const { id, ...updateData } = currentItem;

      if (isEditing) {
        ({ error } = await supabase.from(tableName).update(updateData).eq('id', id).select());
      } else {
        ({ error } = await supabase.from(tableName).insert([updateData]).select());
      }

      if (error) throw error;

      toast.success(`Item successfully ${isEditing ? 'updated' : 'added'}!`, { id: toastId });
      onUpdate();
      handleCloseForm();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} item.`, { id: toastId });
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const toastId = toast.loading('Deleting item...');
      try {
        const { error } = await supabase.from(tableName).delete().eq('id', currentItem.id);
        if (error) throw error;
        toast.success('Item deleted!', { id: toastId });
        onUpdate();
        handleCloseForm();
      } catch (error) {
        toast.error('Failed to delete item.', { id: toastId });
        console.error(error);
      }
    }
  };

  const renderInput = (col) => {
    const isRequired = col.required !== false;

    switch (col.key) {
        case 'pay_type':
            return (
                <select name={col.key} value={currentItem[col.key] || ''} onChange={handleInputChange} required={isRequired}>
                    {payTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            );
        case 'flsa_type':
            return (
                <select name={col.key} value={currentItem[col.key] || ''} onChange={handleInputChange} required={isRequired}>
                    {flsaTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            );
        case 'eeoc_id':
            return (
                <select name={col.key} value={currentItem[col.key] || ''} onChange={handleInputChange} required={isRequired}>
                    {eeocCategories.map(cat => {
                        const val = `${cat.code} - ${cat.name}`;
                        return <option key={cat.code} value={val}>{val}</option>;
                    })}
                </select>
            );
        case 'workers_comp_code':
            return (
                <select name={col.key} value={currentItem[col.key] || ''} onChange={handleInputChange} required={isRequired}>
                    <option value="" disabled>Select a code</option>
                    {workersCompCodes.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
            );
        default:
            return <input type="text" name={col.key} value={currentItem[col.key] || ''} onChange={handleInputChange} required={isRequired} />;
    }
  }

  return (
    <div className="card">
      <div className="page-header">
        <h2>{title}</h2>
        <button className="add-button action-button-small" onClick={() => handleOpenForm()}>Add New</button>
      </div>
      <div className="card-body">
        <table className="employees-table">
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.header}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                {columns.map(col => <td key={col.key}>{item[col.key]}</td>)}
                <td className="action-buttons-cell">
                  <button className="action-button-small" onClick={() => handleOpenForm(item)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && currentItem && (
        <Modal onClose={handleCloseForm} size="large">
          <h3>{isEditing ? 'Edit' : 'Add'} {title.slice(0, -1)}</h3>
          <form onSubmit={handleSubmit}>
            {title === 'Job Codes' && (
              <p className="form-note">
                <strong>Note:</strong> Pay Type, FLSA Type, and EEOC Category use standard industry classifications to ensure data consistency and cannot be customized.
              </p>
            )}
            <div className="settings-form-grid">
              {columns.map(col => (
                <div className="form-group" key={col.key}>
                  <label>{col.header}</label>
                  {renderInput(col)}
                </div>
              ))}
            </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <button type="submit" className="submit-button">Save</button>
                {isEditing && (
                    <button type="button" className="action-button-delete" onClick={handleDelete}>
                        Delete
                    </button>
                )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};


function EmployeeSettings() {
  const [jobCodes, setJobCodes] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [employeeStatuses, setEmployeeStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobCodes');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobCodesRes, empTypesRes, empStatusesRes] = await Promise.all([
        supabase.from('job_codes').select('*').order('code'),
        supabase.from('employment_types').select('*'),
        supabase.from('employee_statuses').select('*'),
      ]);

      if (jobCodesRes.error) throw jobCodesRes.error;
      if (empTypesRes.error) throw empTypesRes.error;
      if (empStatusesRes.error) throw empStatusesRes.error;

      setJobCodes(jobCodesRes.data);
      setEmploymentTypes(empTypesRes.data);
      setEmployeeStatuses(empStatusesRes.data);
    } catch (error) {
      toast.error('Failed to fetch employee settings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="page-container"><h1>Loading Settings...</h1></div>;
  }

  const jobCodeColumns = [
    { key: 'code', header: 'Job Code' }, { key: 'description', header: 'Description', required: false },
    { key: 'pay_type', header: 'Pay Type' }, { key: 'eeoc_id', header: 'EEOC Category' },
    { key: 'flsa_type', header: 'FLSA Type' }, { key: 'workers_comp_code', header: 'Workers Comp' }
  ];

  const employmentTypeColumns = [
    { key: 'name', header: 'Type Name' },
    { key: 'description', header: 'Description', required: false }
  ];

  return (
    <div>
      <h1>Employee Settings</h1>
      <p>Manage the options available for employee profiles.</p>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'jobCodes' ? 'active' : ''}`} onClick={() => setActiveTab('jobCodes')}>Job Codes</button>
        <button className={`tab-button ${activeTab === 'empTypes' ? 'active' : ''}`} onClick={() => setActiveTab('empTypes')}>Employment Types</button>
        <button className={`tab-button ${activeTab === 'empStatuses' ? 'active' : ''}`} onClick={() => setActiveTab('empStatuses')}>Employee Statuses</button>
      </div>

      {activeTab === 'jobCodes' && (
        <SettingManager title="Job Codes" tableName="job_codes" columns={jobCodeColumns} items={jobCodes} onUpdate={fetchData} />
      )}
      {activeTab === 'empTypes' && (
        <SettingManager title="Employment Types" tableName="employment_types" columns={employmentTypeColumns} items={employmentTypes} onUpdate={fetchData} />
      )}
      {activeTab === 'empStatuses' && (
        <SettingManager title="Employee Statuses" tableName="employee_statuses" columns={[{ key: 'name', header: 'Status Name' }]} items={employeeStatuses} onUpdate={fetchData} />
      )}
    </div>
  );
}

export default EmployeeSettings;