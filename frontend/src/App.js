// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import Home from './components/Home';
import RestaurantDetail from './components/RestaurantDetail';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Login from './components/Login';
import Register from './components/Register';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  // auth user object: { id, name, email } or null
  const [user, setUser] = useState(null);

  // cart persisted in localStorage
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // default user location (Avinashi)
  const [location, setLocation] = useState({ lat: 11.0, lng: 77.27 });

  // load location and token on first mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // ignore error, keep default
      }
    );

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // persist cart whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // when user logs in, Login component should:
  // localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
  // and call setUser(user)

  return (
    <Router>
      <Navbar user={user} setUser={setUser} cart={cart} />
      <div className="container-fluid p-0">
        <Routes>
          <Route path="/" element={<Home location={location} />} />

          <Route
            path="/restaurant/:id"
            element={
              <RestaurantDetail
                location={location}
                cart={cart}
                setCart={setCart}
              />
            }
          />

          <Route
            path="/cart"
            element={<Cart cart={cart} setCart={setCart} />}
          />

          <Route path="/orders" element={<Orders user={user} />} />

          <Route path="/login" element={<Login setUser={setUser} />} />

          <Route path="/register" element={<Register />} />

          {/* optional 404 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
