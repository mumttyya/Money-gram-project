import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const API_BASE_URL = 'http://127.0.0.1:5555';

const SendMoney = ({ user, onTransaction }) => {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validationSchema = Yup.object({
    recipientPhoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Recipient phone number must be 10 digits')
      .required('Required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .positive('Amount must be positive')
      .min(0.01, 'Amount must be greater than zero')
      .required('Required'),
    notes: Yup.string().optional()
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setMessage('');
    fetch(`${API_BASE_URL}/send_money`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_phone: values.recipientPhoneNumber,
        amount: parseFloat(values.amount),
        notes: values.notes,
      }),
    })
      .then(res => {
        if (res.ok) {
          setIsSuccess(true);
          setMessage('Transaction successful!');
          res.json().then(data => onTransaction(user.balance - data.amount));
          resetForm();
        } else {
          res.json().then(err => {
            setIsSuccess(false);
            setMessage(err.error || 'Transaction failed. Please try again.');
          });
        }
      })
      .catch(() => {
        setIsSuccess(false);
        setMessage('A network error occurred. Please try again.');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Send Money</h2>
        <Formik
          initialValues={{ recipientPhoneNumber: '', amount: '', notes: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="recipientPhoneNumber" placeholder="Recipient Phone Number" />
              <ErrorMessage name="recipientPhoneNumber" component="div" className="error-message" />
              <Field type="number" name="amount" placeholder="Amount" step="0.01" />
              <ErrorMessage name="amount" component="div" className="error-message" />
              <Field type="text" name="notes" placeholder="Notes (Optional)" />
              <ErrorMessage name="notes" component="div" className="error-message" />
              {message && <div className={isSuccess ? 'success-message' : 'error-message'}>{message}</div>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SendMoney;
