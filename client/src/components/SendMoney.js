import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const SendMoney = ({ user }) => {
  const validationSchema = Yup.object({
    recipientPhoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Recipient phone number must be 10 digits')
      .required('Required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .min(0.01, 'Amount must be greater than zero')
      .required('Required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    fetch('/send_money', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient_phone: values.recipientPhoneNumber,
        amount: values.amount,
      }),
    })
      .then(res => {
        if (res.ok) {
          alert('Transaction successful!');
          // You might want to update the user's balance here
        } else {
          alert('Transaction failed. Check recipient or balance.');
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Send Money</h2>
        <Formik
          initialValues={{ recipientPhoneNumber: '', amount: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="recipientPhoneNumber" placeholder="Recipient Phone Number" />
              <ErrorMessage name="recipientPhoneNumber" component="div" />
              <Field type="number" name="amount" placeholder="Amount" />
              <ErrorMessage name="amount" component="div" />
              <button type="submit" disabled={isSubmitting}>
                Send
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SendMoney;