import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// const statuses = ['Active', 'On Leave', 'Terminated']; // This line is now removed

function AllEmployees() {
  const [employees, setEmployees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Toggle function for better readability
  const toggleAddForm = () => setShowAddForm((prev) => !prev);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employees.');
        setEmployees([]);
      } else {
        setEmployees(data);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  if (loading) return <p>Loading employees...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>All Employees</h2>
      <button onClick={toggleAddForm}>
        {showAddForm ? 'Cancel' : 'Add New Employee'}
      </button>

      {showAddForm && (
        <div>
          <h3>Add New Employee Form</h3>
          {/* Form fields would go here */}
        </div>
      )}

      {employees && employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees && employees.map(employee => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.email}</td>
                <td>{employee.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllEmployees;