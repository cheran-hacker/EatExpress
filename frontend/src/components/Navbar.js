// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser, cart }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const cartCount = cart?.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top px-4 py-3"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Link className="navbar-brand fw-bold text-primary fs-3" to="/">
        <i className="fas fa-utensils me-2"></i> EatsExpress
      </Link>

      <button
        className="navbar-toggler border-0 shadow-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-center gap-3">
          <li className="nav-item">
            <Link className="nav-link fw-medium text-dark" to="/">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link fw-medium text-dark position-relative" to="/cart">
              <i className="fas fa-shopping-bag fs-5"></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>

          {user ? (
            <>
              <li className="nav-item">
                <Link className="nav-link fw-medium text-dark" to="/orders">
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <div className="dropdown">
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    type="button"
                    onClick={logout}
                  >
                    <span>{user.name}</span>
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="btn btn-primary px-4" to="/login">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
