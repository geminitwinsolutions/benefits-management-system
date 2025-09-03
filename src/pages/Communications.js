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
    <div>
      <h2>Carrier & Broker Communications</h2>
      <div className="communications-layout">
        <div className="contact-list">
          <h3>Contacts</h3>
          {contacts.map((contact, index) => (
            <div className="contact-card" key={index}>
              <strong>{contact.name}</strong>
              <span>{contact.company} - {contact.role}</span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
          ))}
        </div>
        <div className="communication-log">
          <h3>Communication Log</h3>
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
  );
}

export default Communications;