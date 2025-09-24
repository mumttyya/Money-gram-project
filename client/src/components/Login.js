import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const API_BASE_URL = 'http://127.0.0.1:5555';

const Login = ({ setUser }) => {
  const [error, setError] = useState(null);

  const validationSchema = Yup.object({
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Required'),
    password: Yup.string().required('Required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setError(null);
    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: values.phoneNumber, password: values.password }),
    })
      .then(res => {
        if (res.ok) {
          res.json().then(setUser);
        } else {
          res.json().then(err => setError(err.error || 'Login failed. Please check your credentials.')).catch(() => setError('Login failed. Please check your credentials.'));
        }
      })
      .catch(() => setError('A network error occurred. Please try again.'))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login to Your Account</h2>
        <Formik
          initialValues={{ phoneNumber: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="phoneNumber" placeholder="Phone Number" />
              <ErrorMessage name="phoneNumber" component="div" className="error-message" />
              <Field type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" className="error-message" />
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
