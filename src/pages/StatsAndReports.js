import React, { useState, useEffect } from 'react';
import { getEnrollmentsWithEmployeeData } from '../services/benefitService';


function StatsAndReports() {
  const [stats, setStats] = useState({
    monthlyCost: 0,
    enrollmentRate: 0,
    supportTickets: 8, // Static for now
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const enrollments = await getEnrollmentsWithEmployeeData();

      const monthlyCost = enrollments.reduce((acc, enrollment) => {
        return acc + Object.values(enrollment.selections).reduce((planAcc, plan) => planAcc + plan.cost, 0);
      }, 0);

      // This is a simplified enrollment rate. You might want to get total employees for a more accurate rate.
      const enrollmentRate = 92; // Placeholder, as we don't have total employee count here without another fetch

      setStats(prev => ({ ...prev, monthlyCost, enrollmentRate }));
      setLoading(false);
    }
    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Stats & Reports...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Stats and Reports</h1>
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Monthly Cost</h4>
          <p>${stats.monthlyCost.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <h4>Enrollment Rate</h4>
          <p>{stats.enrollmentRate}%</p>
        </div>
        <div className="kpi-card">
          <h4>Support Tickets</h4>
          <p>{stats.supportTickets}</p>
        </div>
      </div>
      <div className="chart-placeholder">
        <h3>Enrollment Trends (YoY)</h3>
        <p>(Chart would be displayed here)</p>
      </div>
    </div>
  );
}

export default StatsAndReports;