import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:5555';

function Signup() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      phoneNumber: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      phoneNumber: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            phone_number: values.phoneNumber,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Store user ID as token
          localStorage.setItem('moneygram_token', data.user.id);
          localStorage.setItem('user', JSON.stringify(data.user));

          navigate('/'); // Redirect to home/dashboard
        } else {
          setError(data.error || 'Failed to register.');
        }
      } catch (err) {
        setError('Failed to connect to server.');
      }
    },
  });

  return (
    <div className="form-container">
      <div className="card">
        <h2 className="form-title">Sign Up</h2>
        <form onSubmit={formik.handleSubmit} className="form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              name="username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className="input"
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Phone Number"
              name="phoneNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              className="input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="input"
            />
          </div>
          {error && <div className="server-error">{error}</div>}
          <button type="submit" className="button primary-button">Sign Up</button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-button">
              Already have an account? Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;