import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Static Data for Charts ---
const COLORS = ['#844FC1', '#21BF06', '#e74c3c', '#3B86D1'];
const barChartData = [
  { name: 'Dept A', enrolled: 15 }, { name: 'Dept B', enrolled: 5 },
  { name: 'Dept C', enrolled: 9 }, { name: 'Dept D', enrolled: 15 },
  { name: 'Dept E', enrolled: 10 }, { name: 'Dept F', enrolled: 2 },
];
const lineChartData = [
  { name: 'Jan', employees: 120 }, { name: 'Feb', employees: 125 },
  { name: 'Mar', employees: 135 }, { name: 'Apr', employees: 138 },
  { name: 'May', employees: 142 }, { name: 'Jun', employees: 150 },
];

const initialLayouts = {
  lg: [
    { i: 'overview', x: 0, y: 1, w: 2, h: 4 }, { i: 'employees', x: 0, y: 4, w: 2, h: 1 },
    { i: 'tiers', x: 0, y: 5, w: 1, h: 1 }, { i: 'services', x: 1, y: 5, w: 1, h: 1 },
    { i: 'approvals', x: 2, y: 0, w: 2, h: 1 }, { i: 'rate', x: 4, y: 0, w: 2, h: 1 },
    { i: 'enrolled', x: 6, y: 0, w: 2, h: 1 }, { i: 'pie', x: 2, y: 1, w: 2, h: 3 },
    { i: 'bar', x: 4, y: 1, w: 4, h: 3 }, { i: 'trends', x: 2, y: 3, w: 6, h: 2 },
    { i: 'deadlines', x: 8, y: 1, w: 4, h: 3 }, { i: 'actions', x: 8, y: 3, w: 4, h: 3 },
  ],
  md: [ 
    { i: 'overview', x: 0, y: 0, w: 3, h: 2 }, { i: 'approvals', x: 3, y: 0, w: 2, h: 1 },
    { i: 'rate', x: 5, y: 0, w: 2, h: 1 }, { i: 'enrolled', x: 7, y: 0, w: 3, h: 1 },
    { i: 'employees', x: 3, y: 1, w: 2, h: 1 }, { i: 'tiers', x: 5, y: 1, w: 2, h: 1 },
    { i: 'services', x: 7, y: 1, w: 3, h: 1 }, { i: 'pie', x: 0, y: 2, w: 5, h: 2 },
    { i: 'bar', x: 5, y: 2, w: 5, h: 2 }, { i: 'trends', x: 0, y: 4, w: 10, h: 2 },
    { i: 'deadlines', x: 0, y: 6, w: 5, h: 2 }, { i: 'actions', x: 5, y: 6, w: 5, h: 3 },
  ],
  sm: [
    { i: 'overview', x: 0, y: 0, w: 6, h: 2 }, { i: 'approvals', x: 0, y: 2, w: 3, h: 1 },
    { i: 'rate', x: 3, y: 2, w: 3, h: 1 }, { i: 'enrolled', x: 0, y: 3, w: 3, h: 1 },
    { i: 'deadlines', x: 3, y: 3, w: 3, h: 2 }, { i: 'employees', x: 0, y: 5, w: 6, h: 1 },
    { i: 'tiers', x: 0, y: 6, w: 3, h: 1 }, { i: 'services', x: 3, y: 6, w: 3, h: 1 },
    { i: 'pie', x: 0, y: 7, w: 6, h: 2 }, { i: 'bar', x: 0, y: 9, w: 6, h: 2 },
    { i: 'trends', x: 0, y: 11, w: 6, h: 2 }, { i: 'actions', x: 0, y: 13, w: 6, h: 3 },
  ],
  xs: [
    { i: 'overview', x: 0, y: 0, w: 4, h: 2 }, { i: 'approvals', x: 0, y: 2, w: 4, h: 1 },
    { i: 'rate', x: 0, y: 3, w: 4, h: 1 }, { i: 'enrolled', x: 0, y: 4, w: 4, h: 1 },
    { i: 'deadlines', x: 0, y: 5, w: 4, h: 2 }, { i: 'employees', x: 0, y: 7, w: 4, h: 1 },
    { i: 'tiers', x: 0, y: 8, w: 4, h: 1 }, { i: 'services', x: 0, y: 9, w: 4, h: 1 },
    { i: 'pie', x: 0, y: 10, w: 4, h: 2 }, { i: 'bar', x: 0, y: 12, w: 4, h: 2 },
    { i: 'trends', x: 0, y: 14, w: 4, h: 2 }, { i: 'actions', x: 0, y: 16, w: 4, h: 3 },
  ],
  xxs: [
    { i: 'overview', x: 0, y: 0, w: 2, h: 2 }, { i: 'approvals', x: 0, y: 2, w: 2, h: 1 },
    { i: 'rate', x: 0, y: 3, w: 2, h: 1 }, { i: 'enrolled', x: 0, y: 4, w: 2, h: 1 },
    { i: 'deadlines', x: 0, y: 5, w: 2, h: 2 }, { i: 'employees', x: 0, y: 7, w: 2, h: 1 },
    { i: 'tiers', x: 0, y: 8, w: 2, h: 1 }, { i: 'services', x: 0, y: 9, w: 2, h: 1 },
    { i: 'pie', x: 0, y: 10, w: 2, h: 2 }, { i: 'bar', x: 0, y: 12, w: 2, h: 2 },
    { i: 'trends', x: 0, y: 14, w: 2, h: 2 }, { i: 'actions', x: 0, y: 16, w: 2, h: 3 },
  ],
};

function getFromLS(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Could not parse layouts from localStorage", e);
    }
  }
  return null;
}

function saveToLS(key, value) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function Dashboard() {
  const [dashboardData] = useState({
    totalEmployees: 150, benefitsEnrolled: 125, enrollmentRate: '83%',
    pendingApprovals: 3, totalTiers: 4, servicesOffered: 12,
    chartData: [{ name: 'Pending', value: 3 }, { name: 'Approved', value: 10 }, { name: 'Flagged', value: 2 }],
  });
  const [actionItems, setActionItems] = useState([
    { id: 1, text: 'Confirm benefits enrollment for Jane Smith', completed: false },
    { id: 2, text: 'Terminate benefits for Peter Jones', completed: false },
    { id: 3, text: 'Review quarterly tax documents', completed: true },
  ]);
  const [clientData] = useState({ name: 'The Premier Companies, Inc.', tier: 'Gold', lastLogin: '09/05/25' });
  const [layouts, setLayouts] = useState(() => getFromLS('dashboardLayouts') || initialLayouts);
  
  const [margin, setMargin] = useState([20, 20]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMargin([15, 15]);
      } else {
        setMargin([20, 20]);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleLayoutChange = (layout, allLayouts) => {
    saveToLS('dashboardLayouts', allLayouts);
    setLayouts(allLayouts);
  };
  
  const handleResetLayout = () => {
    localStorage.removeItem('dashboardLayouts');
    setLayouts(initialLayouts);
  };
  
  const handleToggleComplete = (id) => {
    setActionItems(items => items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };
  
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="action-button" onClick={handleResetLayout}>Reset Layout</button>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={margin}
      >
        <div key="employees" className="widget stat-widget-1">
          <h2>Total Employees</h2><p>{dashboardData.totalEmployees}</p>
        </div>
        <div key="enrolled" className="widget stat-widget-2">
          <h2>Benefits Enrolled</h2><p>{dashboardData.benefitsEnrolled}</p>
        </div>
        <div key="rate" className="widget stat-widget-3">
          <h2>Enrollment Rate</h2><p>{dashboardData.enrollmentRate}</p>
        </div>
        <div key="approvals" className="widget stat-widget-4">
          <h2>Pending Approvals</h2><p>{dashboardData.pendingApprovals}</p>
        </div>
        <div key="tiers" className="widget stat-widget-5">
          <h2>Total Tiers</h2><p>{dashboardData.totalTiers}</p>
        </div>
        <div key="services" className="widget stat-widget-6">
          <h2>Services</h2><p>{dashboardData.servicesOffered}</p>
        </div>

        <div key="trends" className="card">
          <div className="card-header amber"><h2>Monthly Enrollment Trends</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="employees" stroke="var(--primary-color)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div key="pie" className="card">
          <div className="card-header green"><h2>Reconciliation Status</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboardData.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                  {dashboardData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div key="bar" className="card">
          <div className="card-header red"><h2>Enrollment by Department</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip />
                <Bar dataKey="enrolled" fill="var(--secondary-color)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div key="actions" className="card">
          <div className="card-header"><h2>Action Items</h2></div>
          <div className="card-body">
            <table className="simple-table">
              <tbody>
                {actionItems.map(item => (
                  <tr key={item.id}>
                    <td className={item.completed ? 'line-through' : ''}>{item.text}</td>
                    <td>
                      <button onClick={() => handleToggleComplete(item.id)} className="action-button-small">{item.completed ? 'Undo' : 'Done'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div key="overview" className="card">
          <div className="card-header"><h2>Client Overview</h2></div>
          <div className="card-body">
            <p><strong>Name:</strong> {clientData.name}</p>
            <p><strong>Tier:</strong> <span className="tier-badge tier-gold">{clientData.tier}</span></p>
            <p><strong>Last Login:</strong> {clientData.lastLogin}</p>
          </div>
        </div>

        <div key="deadlines" className="card">
          <div className="card-header"><h2>Upcoming Deadlines</h2></div>
          <div className="card-body">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Sep 15</td><td>Open Enrollment Ends</td></tr>
                <tr><td>Oct 01</td><td>Q4 Invoices Due</td></tr>
                <tr><td>Oct 10</td><td>Compliance Docs Submission</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}

export default Dashboard;

