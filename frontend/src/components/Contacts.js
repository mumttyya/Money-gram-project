import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { API_BASE_URL } from '../config';
import Notification from './Notification';
import './style.css';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const formik = useFormik({
    initialValues: {
      phone_number: '',
      nickname: ''
    },
    validationSchema: Yup.object({
      phone_number: Yup.string()
        .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .required('Phone number is required'),
      nickname: Yup.string()
        .min(2, 'Nickname must be at least 2 characters')
        .max(20, 'Nickname must be less than 20 characters')
        .required('Nickname is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      setError('');
      setSuccess('');
      
      try {
        const token = localStorage.getItem('moneygram_token');
        const response = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': token
          },
          body: JSON.stringify(values)
        });

        const data = await response.json();
        
        if (response.ok) {
          setSuccess('Contact added successfully!');
          setNotification({ message: `Contact ${values.nickname} added successfully!`, type: 'success' });
          resetForm();
          fetchContacts();
        } else {
          setError(data.error || 'Failed to add contact');
          setNotification({ message: data.error || 'Failed to add contact', type: 'error' });
        }
      } catch (err) {
        setError('Failed to connect to server');
        setNotification({ message: 'Failed to connect to server', type: 'error' });
      }
    }
  });

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('moneygram_token');
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: {
          'X-User-ID': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const deleteContact = async (contactId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Contact deleted successfully!');
        setNotification({ message: 'Contact deleted successfully!', type: 'success' });
        fetchContacts();
      } else {
        setError('Failed to delete contact');
        setNotification({ message: 'Failed to delete contact', type: 'error' });
      }
    } catch (err) {
      setError('Failed to connect to server');
      setNotification({ message: 'Failed to connect to server', type: 'error' });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="dashboard-container">
      {notification.message && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />
      )}
      <h2 className="dashboard-welcome">My Contacts</h2>
      
      <div className="send-money-form">
        <h3>Add New Contact</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number (10 digits)"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone_number}
              className="input"
            />
            {formik.touched.phone_number && formik.errors.phone_number && (
              <div className="error-message">{formik.errors.phone_number}</div>
            )}
          </div>
          
          <div className="input-group">
            <input
              type="text"
              name="nickname"
              placeholder="Nickname"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.nickname}
              className="input"
            />
            {formik.touched.nickname && formik.errors.nickname && (
              <div className="error-message">{formik.errors.nickname}</div>
            )}
          </div>
          
          {error && <div className="server-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <button type="submit" className="button">Add Contact</button>
        </form>
      </div>

      <div className="transaction-history-demo">
        <h3>My Contacts ({contacts.length})</h3>
        {contacts.length === 0 ? (
          <p>No contacts added yet.</p>
        ) : (
          <div className="contact-grid">
            {contacts.map(contact => (
              <div key={contact.id} className="contact-item">
                <h4>{contact.nickname}</h4>
                <p><strong>Name:</strong> {contact.contact_name}</p>
                <p><strong>Phone:</strong> {contact.contact_phone}</p>
                <p><strong>Added:</strong> {new Date(contact.created_at).toLocaleDateString()}</p>
                <button 
                  className="button delete-button"
                  onClick={() => deleteContact(contact.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Contacts;