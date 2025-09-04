import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const departments = ['Engineering', 'Marketing', 'Sales', 'Operations'];
const statuses = ['Active', 'On Leave', 'Terminated'];

// Example data for the charts and map
const ethnicityData = [
  { name: 'Asian', value: 366 },
  { name: 'Caucasian', value: 252 },
  { name: 'Latino', value: 233 },
  { name: 'Black', value: 64 },
];
const COLORS = ['#84fab0', '#8fd3f4', '#a18cd1', '#fbc2eb'];

const ageGroupData = [
  { age: '25-29', value: 109 },
  { age: '30-34', value: 113 },
  { age: '35-39', value: 105 },
  { age: '40-44', value: 101 },
  { age: '45-49', value: 159 },
];

const tenureData = [
  { tenure: '1-4 Yrs', value: 264 },
  { tenure: '5-9 Yrs', value: 237 },
  { tenure: '10-14 Yrs', value: 158 },
  { tenure: '15-19 Yrs', value: 129 },
];

const bonusData = [
  { bonus: 'None', value: 476 },
  { bonus: 'Low', value: 19 },
  { bonus: 'Moderate', value: 112 },
  { bonus: 'High', value: 138 },
];

const departmentData = [
  { dept: 'IT', value: 225 },
  { dept: 'Engineering', value: 141 },
  { dept: 'Sales', value: 130 },
  { dept: 'HR', value: 114 },
];

const genderData = [
  { gender: 'Female', value: 479 },
  { gender: 'Male', value: 436 },
];

const hiresByGenderData = [
  { year: '2018', Female: 30, Male: 28 },
  { year: '2019', Female: 35, Male: 32 },
  { year: '2020', Female: 40, Male: 38 },
  { year: '2021', Female: 50, Male: 45 },
];

const countryData = [
  { name: 'USA', coordinates: [-100, 40], value: 376 },
  { name: 'Brazil', coordinates: [-51, -10], value: 128 },
  { name: 'India', coordinates: [78, 22], value: 197 },
];

function AllEmployees() {
  const [employees, setEmployees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', status: '' });

  async function getEmployees() {
    setLoading(true);
    const { data } = await supabase.from('employees').select('*');
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => {
    getEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await supabase.from('employees').delete().eq('id', id);
      setEmployees(employees.filter(employee => employee.id !== id));
    }
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
                  <td>
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
          {/* Analytic Cards Row 1 */}
          <div className="stat-cards-row">
            <div className="card">
              <div className="card-header red">
                <h4>Total Employees</h4>
              </div>
              <div className="card-body">
                <p>1000</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header red">
                <h4>Separated Employees</h4>
              </div>
              <div className="card-body">
                <p>85</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header blue">
                <h4>Net Employees</h4>
              </div>
              <div className="card-body">
                <p>915</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header green">
                <h4>Retention Rate</h4>
              </div>
              <div className="card-body">
                <p>81.4%</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header red">
                <h4>Turnover Rate</h4>
              </div>
              <div className="card-body">
                <p>18.6%</p>
              </div>
            </div>
          </div>

          {/* Analytic Cards Row 2 */}
          <div className="stat-cards-row">
            <div className="card">
              <div className="card-header amber">
                <h4>Net Employees by Ethnicity</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={ethnicityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      fill="#8884d8"
                      paddingAngle={2}
                    >
                      {ethnicityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header blue">
                <h4>Net Employees by Age Group</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={ageGroupData}>
                    <XAxis dataKey="age" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#84fab0" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header blue">
                <h4>Net Employees by Tenure</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={tenureData}>
                    <XAxis dataKey="tenure" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#a18cd1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header red">
                <h4>Net Employees by Bonus</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={bonusData}>
                    <XAxis dataKey="bonus" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8fd3f4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header green">
                <h4>Net Employees by Department</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={departmentData}>
                    <XAxis dataKey="dept" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#fbc2eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Analytic Cards Row 3 */}
          <div className="stat-cards-row">
            <div className="card">
              <div className="card-header amber">
                <h4>Employees by Gender</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="gender"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      fill="#8884d8"
                      paddingAngle={2}
                    >
                      <Cell fill="#fa709a" />
                      <Cell fill="#fee140" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header red">
                <h4>Annual Hires by Gender</h4>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hiresByGenderData}>
                    <XAxis dataKey="year" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="Female" fill="#fa709a" />
                    <Bar dataKey="Male" fill="#fee140" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header blue">
                <h4>Net Employees by Country</h4>
              </div>
              <div className="card-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ComposableMap
                  projectionConfig={{ scale: 60 }}
                  width={180}
                  height={120}
                  style={{ width: "100%", height: "auto" }}
                >
                  <Geographies geography="https://unpkg.com/world-atlas@2.0.2/countries-110m.json">
                    {({ geographies }) =>
                      geographies.map(geo => (
                        <Geography key={geo.rsmKey} geography={geo} fill="#EEE" stroke="#DDD" />
                      ))
                    }
                  </Geographies>
                  {countryData.map(({ name, coordinates, value }) => (
                    <Marker key={name} coordinates={coordinates}>
                      <circle r={Math.sqrt(value) / 2} fill="#84fab0" stroke="#333" strokeWidth={0.5} />
                    </Marker>
                  ))}
                </ComposableMap>
              </div>
            </div>
          </div>
        </div>
      </div>

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