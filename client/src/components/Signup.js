import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const Signup = ({ setUser }) => {
  const validationSchema = Yup.object({
    username: Yup.string().min(3, 'Username must be at least 3 characters').required('Required'),
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    fetch('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: values.username,
        phone_number: values.phoneNumber,
        password: values.password,
      }),
    })
      .then(res => {
        if (res.ok) {
          res.json().then(setUser);
        } else {
          // Handle signup error
          alert('Sign up failed. User might already exist.');
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Sign Up</h2>
        <Formik
          initialValues={{ username: '', phoneNumber: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="username" placeholder="Username" />
              <ErrorMessage name="username" component="div" />
              <Field type="text" name="phoneNumber" placeholder="Phone Number" />
              <ErrorMessage name="phoneNumber" component="div" />
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