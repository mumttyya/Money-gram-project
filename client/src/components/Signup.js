import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const API_BASE_URL = 'http://127.0.0.1:5555';

const Signup = ({ setUser }) => {
  const [error, setError] = useState(null);

  const validationSchema = Yup.object({
    username: Yup.string().min(3, 'Username must be at least 3 characters').required('Required'),
    phone_number: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setError(null);
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: values.username,
        phone_number: values.phone_number,
        password: values.password,
      }),
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(user => {
            setUser(user);
          });
        } else {
          return res.json().then(errorData => {
            setError(errorData.error || 'Sign up failed.');
          });
        }
      })
      .catch(() => {
        setError('Could not connect to the server.');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create an Account</h2>
        <Formik
          initialValues={{ username: '', phone_number: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="username" placeholder="Username" />
              <ErrorMessage name="username" component="div" className="error-message" />
              <Field type="text" name="phone_number" placeholder="Phone Number" />
              <ErrorMessage name="phone_number" component="div" className="error-message" />
              <Field type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" className="error-message" />
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing up...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
