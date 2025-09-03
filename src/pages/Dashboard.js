import React, { useState, useEffect } from 'react';
import { getReconciliationItems } from '../services/benefitService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#2c3e50', '#28a745', '#dc3545'];

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 150,
    benefitsEnrolled: 125,
    pendingApprovals: 0,
    totalItems: 0,
    chartData: []
  });
  const [actionItems, setActionItems] = useState([
    { id: 1, text: 'Confirm benefits enrollment for Jane Smith', completed: false, notes: '' },
    { id: 2, text: 'Terminate benefits for Peter Jones', completed: false, notes: '' },
    { id: 3, text: 'Review quarterly tax documents', completed: true, notes: 'Completed on 8/28/25' },
  ]);
  const [loading, setLoading] = useState(true);
  const [clientData] = useState({ name: 'The Premier Companies, Inc.', tier: 'Gold', totalClients: 1, lastLogin: '8/29/25' }); // Mock client data

  async function fetchReconciliationData() {
    try {
      const items = await getReconciliationItems();
      const pendingCount = items.filter(item => item.status === 'Pending').length;
      const approvedCount = items.filter(item => item.status === 'Approved').length;
      const flaggedCount = items.filter(item => item.status === 'Flagged').length;

      const chartData = [
        { name: 'Pending', value: pendingCount },
        { name: 'Approved', value: approvedCount },
        { name: 'Flagged', value: flaggedCount },
      ].filter(data => data.value > 0);

      setDashboardData(prev => ({
        ...prev,
        pendingApprovals: pendingCount,
        totalItems: items.length,
        chartData: chartData
      }));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  const handleToggleComplete = (id) => {
    setActionItems(actionItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddNote = (id, note) => {
    setActionItems(actionItems.map(item => 
      item.id === id ? { ...item, notes: note } : item
    ));
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-grid">
      <div className="main-content">
        <h1>Dashboard</h1>
        <div className="widgets-container">
          <div className="widget">
            <h2>Total Employees</h2>
            <p>{dashboardData.totalEmployees}</p>
          </div>
          <div className="widget">
            <h2>Benefits Enrolled</h2>
            <p>{dashboardData.benefitsEnrolled}</p>
          </div>
          <div className="widget">
            <h2>Pending Approvals</h2>
            <p>{dashboardData.pendingApprovals}</p>
          </div>
        </div>
        
        <div className="chart-container">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Reconciliation Status Overview</h2>
          {dashboardData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dashboardData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No reconciliation data to display.</p>
          )}
        </div>

      </div>
      <div className="sidebar-content">
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Client Overview</h2>
          <p><strong>Name:</strong> {clientData.name}</p>
          <p><strong>Tier:</strong> <span className="tier-badge tier-gold">{clientData.tier}</span></p>
          <p><strong>Total Clients:</strong> {clientData.totalClients}</p>
          <p><strong>Last Login:</strong> {clientData.lastLogin}</p>
        </div>
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Deadlines</h2>
          <div className="calendar">
            <div className="calendar-header mb-2 flex justify-between items-center">
              <button className="text-sm font-semibold text-gray-600">&lt;</button>
              <h4 className="text-lg font-bold text-gray-800">September 2025</h4>
              <button className="text-sm font-semibold text-gray-600">&gt;</button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="grid grid-cols-7 text-center text-sm">
              {[...Array(30)].map((_, i) => (
                <div key={i} className={`p-1.5 border ${i + 1 === 15 ? 'bg-gold-200' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Action Items</h2>
          <table className="employees-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Notes</th>
                <th className="w-16">Status</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actionItems.map(item => (
                <tr key={item.id}>
                  <td className={item.completed ? 'line-through text-gray-500' : ''}>{item.text}</td>
                  <td>
                    <textarea 
                      value={item.notes} 
                      onChange={(e) => handleAddNote(item.id, e.target.value)}
                      className="w-full text-sm border rounded p-1"
                      placeholder="Add notes..."
                    />
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${item.completed ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.completed ? 'Done' : 'Open'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleToggleComplete(item.id)} className="action-button-approve">
                      {item.completed ? 'Re-open' : 'Complete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
