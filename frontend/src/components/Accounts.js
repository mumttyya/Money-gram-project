import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { API_BASE_URL } from '../config';
import './style.css';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      account_type: 'savings',
      balance: ''
    },
    validationSchema: Yup.object({
      account_type: Yup.string()
        .oneOf(['savings', 'checking', 'mobile_money'], 'Invalid account type')
        .required('Account type is required'),
      balance: Yup.number()
        .min(0, 'Balance must be positive')
        .max(1000000, 'Balance cannot exceed 1,000,000')
        .required('Initial balance is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      setError('');
      setSuccess('');
      
      try {
        const token = localStorage.getItem('moneygram_token');
        const response = await fetch(`${API_BASE_URL}/accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': token
          },
          body: JSON.stringify({
            account_type: values.account_type,
            balance: parseFloat(values.balance)
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setSuccess('Account created successfully!');
          resetForm();
          fetchAccounts();
        } else {
          setError(data.error || 'Failed to create account');
        }
      } catch (err) {
        setError('Failed to connect to server');
      }
    }
  });

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('moneygram_token');
      const response = await fetch(`${API_BASE_URL}/accounts`, {
        headers: {
          'X-User-ID': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('Account deleted successfully!');
        fetchAccounts();
      } else {
        setError('Failed to delete account');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-welcome">My Accounts</h2>
      
      <div className="send-money-form">
        <h3>Create New Account</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="input-group">
            <select
              name="account_type"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.account_type}
              className="input"
            >
              <option value="savings">Savings Account</option>
              <option value="checking">Checking Account</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
            {formik.touched.account_type && formik.errors.account_type && (
              <div className="error-message">{formik.errors.account_type}</div>
            )}
          </div>
          
          <div className="input-group">
            <input
              type="number"
              name="balance"
              placeholder="Initial Balance"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.balance}
              className="input"
              step="0.01"
              min="0"
            />
            {formik.touched.balance && formik.errors.balance && (
              <div className="error-message">{formik.errors.balance}</div>
            )}
          </div>
          
          {error && <div className="server-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <button type="submit" className="button">Create Account</button>
        </form>
      </div>

      <div className="transaction-history-demo">
        <h3>My Accounts ({accounts.length})</h3>
        {accounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          <div className="account-grid">
            {accounts.map(account => (
              <div key={account.id} className="account-item">
                <h4>{account.account_type.replace('_', ' ').toUpperCase()}</h4>
                <p><strong>Account #:</strong> {account.account_number}</p>
                <p><strong>Balance:</strong> ${account.balance.toFixed(2)}</p>
                <p><strong>Status:</strong> {account.is_active ? 'Active' : 'Inactive'}</p>
                <p><strong>Created:</strong> {new Date(account.created_at).toLocaleDateString()}</p>
                <button 
                  className="button delete-button"
                  onClick={() => deleteAccount(account.id)}
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

export default Accounts;