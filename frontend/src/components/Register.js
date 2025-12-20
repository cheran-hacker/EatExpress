import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', {
        name,
        email,
        password,
        phone,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);

      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Registration failed, try again.';
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
            <h2 className="fw-bold mb-1">Create Account</h2>
            <p className="text-muted">Join the fastest delivery network</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 rounded-3 text-center" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label fw-medium">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-light text-muted ps-3">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  className="form-control bg-light border-light shadow-none py-2"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-light text-muted ps-3">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  className="form-control bg-light border-light shadow-none py-2"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Phone (Optional)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-light text-muted ps-3">
                  <i className="fas fa-phone"></i>
                </span>
                <input
                  className="form-control bg-light border-light shadow-none py-2"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-light text-muted ps-3">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  className="form-control bg-light border-light shadow-none py-2"
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
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
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Sign Up'}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-bold text-decoration-none">
                Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
