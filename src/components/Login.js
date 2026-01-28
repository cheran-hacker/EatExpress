import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);

      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Login failed, please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card glass-card border-0 p-4"
        style={{ maxWidth: 450, width: '100%' }}
      >
        <div className="card-body">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-muted">Login to continue to EatsExpress</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 rounded-3 text-center" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-light text-muted ps-3">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  id="email"
                  type="email"
                  className="form-control bg-light border-light shadow-none py-2"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" class="form-label fw-medium d-flex justify-content-between">
                Password
                <small className="text-primary text-decoration-none" style={{ cursor: 'pointer' }}>Forgot?</small>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-light text-muted ps-3">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  id="password"
                  type="password"
                  className="form-control bg-light border-light shadow-none py-2"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary w-100 py-2 fs-5 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Login'}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted mb-0">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-bold text-decoration-none">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
