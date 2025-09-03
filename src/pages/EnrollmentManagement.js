import React from 'react';

// Placeholder data
const enrollmentStats = {
  totalEmployees: 150,
  completed: 112,
  notStarted: 38,
};

function EnrollmentManagement() {
  const completionPercentage = Math.round((enrollmentStats.completed / enrollmentStats.totalEmployees) * 100);

  return (
    <div>
      <h2>Enrollment Management</h2>
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Completion Rate</h4>
          <p>{completionPercentage}%</p>
        </div>
        <div className="kpi-card">
          <h4>Completed</h4>
          <p>{enrollmentStats.completed} / {enrollmentStats.totalEmployees}</p>
        </div>
        <div className="kpi-card">
          <h4>Not Started</h4>
          <p>{enrollmentStats.notStarted}</p>
        </div>
      </div>
      <h3>Enrollment Status</h3>
      {/* A detailed table of employees would go here later */}
      <p>A table showing each employee's enrollment status and selections will be displayed here.</p>
    </div>
  );
}

export default EnrollmentManagement;