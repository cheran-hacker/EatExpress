import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState('relevance');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterRating, setFilterRating] = useState(false); // 4.0+
  const [filterCost, setFilterCost] = useState(null); // 'low' | 'high' | null
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get('/restaurants');
        setRestaurants(res.data);
        setFilteredRestaurants(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    let result = restaurants;

    // Search
    if (searchTerm) {
      result = result.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.cuisines && r.cuisines.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filter: Veg (Simplistic assumption: if cuisine implies veg or we check menu... 
    // real app would check "pure veg" flag. For now, we simulate filter)
    if (filterVeg) {
      // Mock logic: filter out 'Burgers', 'Biryani' unless specified otherwise. 
      // In real app, check `r.isVeg`. Here we skip for simplicity or add logic if needed.
    }

    // Filter: Rating 4.0+
    if (filterRating) {
      result = result.filter((r) => r.rating >= 4.0);
    }

    // Sort/Filter Cost
    if (filterCost === 'low') {
      result = [...result].sort((a, b) => a.avgCost - b.avgCost);
    } else if (filterCost === 'high') {
      result = [...result].sort((a, b) => b.avgCost - a.avgCost);
    }

    setFilteredRestaurants(result);
  }, [searchTerm, restaurants, filterVeg, filterRating, filterCost]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <section className="position-relative overflow-hidden p-5 text-center text-md-start" style={{ background: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)', color: 'white', minHeight: '350px' }}>
        <div className="container position-relative z-2">
          <div className="row align-items-center">
            <div className="col-md-7">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="display-4 fw-bold mb-3"
              >
                Delicious Food,<br /> Delivered To You
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="lead mb-4 opacity-75"
              >
                Discover the best food & drinks in Avinashi.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-2 rounded-pill shadow-lg d-flex align-items-center"
                style={{ maxWidth: '500px' }}
              >
                <i className="fas fa-search text-danger ms-3 me-2 fs-5"></i>
                <input
                  type="text"
                  className="form-control border-0 shadow-none fs-5 text-dark"
                  placeholder="Search for restaurant, cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </div>
            <div className="col-md-5 d-none d-md-block">
              <motion.img
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png"
                alt="Delivery"
                className="img-fluid"
                style={{ maxHeight: '300px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <div className="container py-5">

        {/* Filters */}
        <div className="d-flex flex-wrap gap-2 mb-4 sticky-top bg-light py-2" style={{ zIndex: 10 }}>
          <button
            className={`btn rounded-pill border shadow-sm ${filterRating ? 'btn-danger' : 'btn-white'}`}
            onClick={() => setFilterRating(!filterRating)}
          >
            Rating 4.0+
          </button>
          <button
            className={`btn rounded-pill border shadow-sm ${filterCost === 'low' ? 'btn-danger' : 'btn-white'}`}
            onClick={() => setFilterCost(filterCost === 'low' ? null : 'low')}
          >
            Cost: Low to High
          </button>
          <button
            className={`btn rounded-pill border shadow-sm ${filterCost === 'high' ? 'btn-danger' : 'btn-white'}`}
            onClick={() => setFilterCost(filterCost === 'high' ? null : 'high')}
          >
            Cost: High to Low
          </button>
        </div>

        <h3 className="fw-bold mb-4 pt-2">Best Food in Avinashi</h3>

        <div className="row g-4">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={restaurant._id}
              className="col-md-6 col-lg-4"
            >
              <Link to={`/restaurant/${restaurant._id}`} className="text-decoration-none">
                <div className="card h-100 border-0 shadow-sm hover-shadow overflow-hidden rounded-4 restaurant-card">
                  <div className="position-relative">
                    <img
                      src={restaurant.image}
                      className="card-img-top"
                      alt={restaurant.name}
                      style={{ height: '220px', objectFit: 'cover' }}
                    />
                    {restaurant.isPromoted && (
                      <span className="position-absolute top-0 start-0 m-3 badge bg-dark text-uppercase fs-7 px-2 py-1 rounded">
                        Promoted
                      </span>
                    )}
                    <div className="position-absolute bottom-0 end-0 m-3 bg-light rounded px-2 py-1 shadow-sm fs-7 fw-bold">
                      {restaurant.deliveryTime}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h5 className="card-title fw-bold text-dark mb-0 fs-4">{restaurant.name}</h5>
                      <span className="badge bg-success d-flex align-items-center gap-1 fs-6 px-2 py-1 rounded-3">
                        {restaurant.rating} <i className="fas fa-star" style={{ fontSize: '0.7em' }}></i>
                      </span>
                    </div>

                    <div className="d-flex justify-content-between text-muted fs-7 mb-2">
                      <span className="text-truncate" style={{ maxWidth: '65%' }}>{restaurant.cuisines.join(', ')}</span>
                      <span>₹{restaurant.avgCost} for two</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2">
                      <span className="text-muted fs-7"><i className="fas fa-map-marker-alt me-1 text-danger opacity-75"></i> Avinashi</span>
                      <span className="text-primary fw-bold fs-7">View Menu &rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {filteredRestaurants.length === 0 && (
            <div className="col-12 text-center py-5">
              <img src="https://cdn-icons-png.flaticon.com/512/11329/11329144.png" alt="No results" style={{ width: '80px', opacity: 0.5 }} className="mb-3" />
              <h5 className="text-muted">No restaurants found</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
