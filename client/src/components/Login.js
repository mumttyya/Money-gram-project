import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css';

const Login = ({ setUser }) => {
  const validationSchema = Yup.object({
    phoneNumber: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Required'),
    password: Yup.string().required('Required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: values.phoneNumber, password: values.password }),
    })
      .then(res => {
        if (res.ok) {
          res.json().then(setUser);
        } else {
          alert('Login failed. Please check your credentials.');
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <Formik
          initialValues={{ phoneNumber: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="form-container">
              <Field type="text" name="phoneNumber" placeholder="Phone Number" />
              <ErrorMessage name="phoneNumber" component="div" />
              <Field type="password" name="password" placeholder="Password" />
              <ErrorMessage name="password" component="div" />
              <button type="submit" disabled={isSubmitting}>
                Log In
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;