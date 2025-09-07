import React, { useState, useEffect } from 'react';
import { getContacts, addContact, getCommunicationLogs, addCommunicationLog } from '../services/benefitService';
import Modal from '../components/Modal';

function Communications() {
  const [contacts, setContacts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [newLog, setNewLog] = useState({ date: '', contact_id: '', subject: '', notes: '' });
  const [newContact, setNewContact] = useState({ name: '', company: '', role: '', email: '' });

  async function fetchData() {
    setLoading(true);
    const [contactsData, logsData] = await Promise.all([getContacts(), getCommunicationLogs()]);
    setContacts(contactsData);
    setLogs(logsData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogInputChange = (e) => {
    const { name, value } = e.target;
    setNewLog(prev => ({ ...prev, [name]: value }));
  };

  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    await addCommunicationLog(newLog);
    fetchData();
    setShowLogForm(false);
    setNewLog({ date: '', contact_id: '', subject: '', notes: '' });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    await addContact(newContact);
    fetchData();
    setShowContactForm(false);
    setNewContact({ name: '', company: '', role: '', email: '' });
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Communications Data...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Carrier & Broker Communications</h1>
        <div>
          <button className="add-button" onClick={() => setShowContactForm(true)} style={{ marginRight: '1rem' }}>Add Contact</button>
          <button className="add-button" onClick={() => setShowLogForm(true)}>Log Communication</button>
        </div>
      </div>
      <p>A central place to track all interactions with external partners.</p>

      <div className="plan-management-layout">
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
                    <td>{contacts.find(c => c.id === log.contact_id)?.name || 'Unknown'}</td>
                    <td>{log.subject}</td>
                    <td>{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showLogForm && (
        <Modal onClose={() => setShowLogForm(false)}>
          <h3>Log New Communication</h3>
          <form className="add-employee-form" onSubmit={handleLogSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={newLog.date} onChange={handleLogInputChange} required />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <select name="contact_id" value={newLog.contact_id} onChange={handleLogInputChange} required>
                <option value="" disabled>Select a contact</option>
                {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" name="subject" value={newLog.subject} onChange={handleLogInputChange} required />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={newLog.notes} onChange={handleLogInputChange} />
            </div>
            <button type="submit" className="submit-button">Save Log</button>
          </form>
        </Modal>
      )}

      {showContactForm && (
        <Modal onClose={() => setShowContactForm(false)}>
          <h3>Add New Contact</h3>
          <form className="add-employee-form" onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={newContact.name} onChange={handleContactInputChange} required />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input type="text" name="company" value={newContact.company} onChange={handleContactInputChange} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" name="role" value={newContact.role} onChange={handleContactInputChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={newContact.email} onChange={handleContactInputChange} />
            </div>
            <button type="submit" className="submit-button">Save Contact</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Communications;