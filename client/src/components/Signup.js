import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const Signup = ({ setUser }) => {
  const validationSchema = Yup.object({
    username: Yup.string().min(3, 'Username must be at least 3 characters').required('Required'),
    phone_number: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
  fetch('http://127.0.0.1:5555/users', {
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
      return res.json().then(setUser);
    } else {
      return res.json().then(errorData => {
        // Log the error from the backend for detailed debugging.
        console.error('Backend Error:', errorData);
        alert(errorData.error || 'Sign up failed.');
      });
    }
  })
  .catch(error => {
    // This catches network errors
    console.error('Network Error:', error);
    alert('Could not connect to the server.');
  })
  .finally(() => setSubmitting(false));
};

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up</h2>
        <Formik
          initialValues={{ username: '', phone_number: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="username" placeholder="Username" />
              <ErrorMessage name="username" component="div" />
              <Field type="text" name="phone_number" placeholder="Phone Number" />
              <ErrorMessage name="phone_number" component="div" />
              <Field type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" />
              <button type="submit" disabled={isSubmitting}>
                Sign Up
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;