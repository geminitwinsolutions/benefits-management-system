import React from 'react';

function StatsAndReports() {
  return (
    <div className="page-container">
      <h1>Stats and Reports</h1>
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Monthly Cost</h4>
          <p>$45,250</p>
        </div>
        <div className="kpi-card">
          <h4>Enrollment Rate</h4>
          <p>92%</p>
        </div>
        <div className="kpi-card">
          <h4>Support Tickets</h4>
          <p>8</p>
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