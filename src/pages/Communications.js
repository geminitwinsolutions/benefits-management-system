import React, { useState } from 'react';

// Mock data for contacts and logs
const initialContacts = [
  { name: 'Sarah Miller', company: 'Global Health Inc.', role: 'Carrier Rep', email: 's.miller@globalhealth.com' },
  { name: 'Tom Chen', company: 'VisionFirst', role: 'Carrier Rep', email: 't.chen@visionfirst.com' },
  { name: 'Linda Brook', company: 'SecureBrokers LLC', role: 'Broker', email: 'l.brook@securebrokers.com' },
];

const initialLogs = [
  { date: '2025-08-28', contact: 'Sarah Miller', subject: 'Q4 Premium Rates', notes: 'Received final premium rates for the upcoming year. Sent to finance for review.' },
  { date: '2025-08-25', contact: 'Linda Brook', subject: 'Open Enrollment Planning', notes: 'Kick-off call to discuss timeline and employee communication strategy.' },
];

function Communications() {
  const [contacts] = useState(initialContacts);
  const [logs] = useState(initialLogs);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Carrier & Broker Communications</h1>
        <button className="add-button">Log New Communication</button>
      </div>
      <p>A central place to track all interactions with external partners.</p>

      <div className="plan-management-layout">
        {/* Contacts Card */}
        <div className="card">
          <div className="card-header blue">
            <h2>Contacts</h2>
          </div>
          <div className="card-body">
            <div className="contact-cards-container">
              {contacts.map((contact, index) => (
                <div className="info-card" key={index}>
                  <h3>{contact.name}</h3>
                  <p>{contact.company} - {contact.role}</p>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Communication Log Card */}
        <div className="card">
          <div className="card-header">
            <h2>Communication Log</h2>
          </div>
          <div className="card-body">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.date}</td>
                    <td>{log.contact}</td>
                    <td>{log.subject}</td>
                    <td>{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Communications;