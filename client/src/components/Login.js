import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:5555';

function Login({ onLogin }) {
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      phoneNumber: '',
      password: '',
    },
    validationSchema: Yup.object({
      phoneNumber: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: values.phoneNumber,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Store user ID as token
          localStorage.setItem('moneygram_token', data.user.id);
          localStorage.setItem('user', JSON.stringify(data.user));

          onLogin(data.user, data.user.id);
        } else {
          setError(data.error || 'Failed to log in.');
        }
      } catch (err) {
        setError('Failed to connect to the server.');
      }
    },
  });

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="form-title">Log In</h2>
        <form onSubmit={formik.handleSubmit} className="form">
          <div className="input-group">
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              placeholder="Phone Number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              className="input"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
              <div className="error-message">{formik.errors.phoneNumber}</div>
            ) : null}
          </div>
          <div className="input-group">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="input"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error-message">{formik.errors.password}</div>
            ) : null}
          </div>
          {error && <div className="server-error">{error}</div>}
          <button type="submit" className="button primary-button">Log In</button>
          <div className="text-center mt-4">
            <Link to="/signup" className="text-button">
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
