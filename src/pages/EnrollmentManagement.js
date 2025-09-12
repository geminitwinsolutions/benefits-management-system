import React, { useState, useEffect } from 'react';
import { getEmployees, getEnrollmentsWithEmployeeData } from '../services/benefitService';

function EnrollmentManagement() {
  const [enrollmentStats, setEnrollmentStats] = useState({
    totalEmployees: 0,
    completed: 0,
    notStarted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [employees, enrollments] = await Promise.all([
        getEmployees(),
        getEnrollmentsWithEmployeeData()
      ]);

      const totalEmployees = employees.length;
      const completed = enrollments.length;
      const notStarted = totalEmployees - completed;

      setEnrollmentStats({
        totalEmployees,
        completed,
        notStarted,
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  const completionPercentage = enrollmentStats.totalEmployees > 0
    ? Math.round((enrollmentStats.completed / enrollmentStats.totalEmployees) * 100)
    : 0;

  if (loading) {
    return <h2>Loading Enrollment Data...</h2>
  }

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