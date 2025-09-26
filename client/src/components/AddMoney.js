import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { API_BASE_URL } from '../config';
import './style.css';

function AddMoney({ onBalanceUpdate }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      amount: ''
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .min(1, 'Amount must be at least $1')
        .max(10000, 'Amount cannot exceed $10,000')
        .required('Amount is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      setError('');
      setSuccess('');
      
      try {
        const token = localStorage.getItem('moneygram_token');
        const response = await fetch(`${API_BASE_URL}/add_money`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': token
          },
          body: JSON.stringify({
            amount: parseFloat(values.amount)
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setSuccess(data.message);
          resetForm();
          if (onBalanceUpdate) {
            onBalanceUpdate(data.new_balance);
          }
        } else {
          setError(data.error || 'Failed to add money');
        }
      } catch (err) {
        setError('Failed to connect to server');
      }
    }
  });

  return (
    <div className="send-money-form">
      <h3>Add Money to M-Pesa</h3>
      <form onSubmit={formik.handleSubmit}>
        <div className="input-group">
          <input
            type="number"
            name="amount"
            placeholder="Amount to add"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.amount}
            className="input"
            step="0.01"
            min="1"
          />
          {formik.touched.amount && formik.errors.amount && (
            <div className="error-message">{formik.errors.amount}</div>
          )}
        </div>
        
        {error && <div className="server-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <button type="submit" className="button">Add Money</button>
      </form>
    </div>
  );
}

export default AddMoney;