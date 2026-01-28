import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function RestaurantDetail({ cart, setCart }) {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('order'); // 'overview' | 'order' | 'reviews'
  const [vegOnly, setVegOnly] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // Open accordion

  useEffect(() => {
    const loadData = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          axios.get(`/restaurants/${id}`),
          axios.get(`/restaurants/${id}/menu`),
        ]);
        setRestaurant(restRes.data);
        setMenuItems(menuRes.data);

        // Set initial active category
        const categories = [...new Set(menuRes.data.map(i => i.category))];
        if (categories.length > 0) setActiveCategory(categories[0]);

      } catch (err) {
        console.error('Restaurant detail error', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p._id === item._id);
      if (exists) {
        return prev.map((p) =>
          p._id === item._id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...item, qty: 1, restaurantId: id }];
    });
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (!restaurant) return <div className="container mt-5 text-center">Restaurant not found.</div>;

  // Filter Menu Logic
  const filteredMenu = menuItems.filter(item => {
    const matchesVeg = vegOnly ? item.veg === true : true;
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesVeg && matchesSearch;
  });

  // Group by Category
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Hero Gallery */}
      <div className="bg-dark position-relative" style={{ height: '300px' }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-100 h-100 object-fit-cover opacity-75"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop';
          }}
        />
        <div className="position-absolute bottom-0 start-0 w-100 p-4 bg-gradient-to-t" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
          <div className="container text-white">
            <h1 className="display-4 fw-bold mb-1">{restaurant.name}</h1>
            <p className="lead mb-2 opacity-90">{restaurant.cuisines.join(', ')}</p>
            <div className="d-flex align-items-center gap-3 text-sm">
              <span className="badge bg-success fs-6"><i className="fas fa-star me-1"></i>{restaurant.rating}</span>
              <span>|</span>
              <span>{restaurant.address}</span>
              <span>|</span>
              <span><i className="far fa-clock me-1"></i>{restaurant.deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky-top" style={{ top: '70px', zIndex: 99 }}>
        <div className="container">
          <div className="d-flex gap-4">
            {['Overview', 'Order Online', 'Reviews'].map(tab => {
              const key = tab.toLowerCase().split(' ')[0];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`btn border-0 py-3 fw-bold position-relative rounded-0 ${activeTab === key ? 'text-danger' : 'text-muted'}`}
                >
                  {tab}
                  {activeTab === key && (
                    <motion.div
                      layoutId="activeTab"
                      className="position-absolute bottom-0 start-0 w-100 bg-danger"
                      style={{ height: '3px' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          {/* Left Content */}
          <div className="col-lg-8">

            {/* ORDER ONLINE TAB */}
            {activeTab === 'order' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Filters */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check form-switch custom-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="vegToggle"
                      checked={vegOnly}
                      onChange={(e) => setVegOnly(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label fw-bold user-select-none" htmlFor="vegToggle" style={{ cursor: 'pointer' }}>
                      Veg Only <i className="fas fa-leaf text-success ms-1"></i>
                    </label>
                  </div>
                  <div className="input-group w-50">
                    <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted"></i></span>
                    <input
                      type="text"
                      className="form-control border-start-0 shadow-none"
                      placeholder="Search in menu..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Menu Accordions */}
                {categories.length === 0 ? (
                  <div className="text-center py-5 text-muted">No items found matching your filters.</div>
                ) : (
                  categories.map(category => (
                    <div key={category} className="mb-4">
                      <h4
                        className="fw-bold mb-3 d-flex justify-content-between align-items-center cursor-pointer"
                        onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                        style={{ cursor: 'pointer' }}
                      >
                        {category} ({groupedMenu[category].length})
                        <i className={`fas fa-chevron-down transition-transform ${activeCategory === category ? 'rotate-180' : ''}`}></i>
                      </h4>

                      <AnimatePresence>
                        {(activeCategory === category || menuSearch) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {groupedMenu[category].map(item => (
                              <div key={item._id} className="card border-0 shadow-sm mb-3">
                                <div className="card-body p-3">
                                  <div className="row align-items-center">
                                    <div className="col-9">
                                      <div className="d-flex align-items-center mb-1">
                                        <i className={`fas fa-circle fs-xs me-2 ${item.veg ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.6rem', border: '1px solid', padding: '2px' }}></i>
                                        <h6 className="mb-0 fw-bold">{item.name}</h6>
                                      </div>
                                      <div className="fw-bold text-muted small mb-2">₹{item.price}</div>
                                      <p className="text-muted small mb-0 text-truncate">{item.description}</p>
                                    </div>
                                    <div className="col-3 text-end position-relative">
                                      <div className="position-relative d-inline-block">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="rounded-3 object-fit-cover"
                                          style={{ width: '100px', height: '100px' }}
                                          onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';
                                          }}
                                        />
                                        <button
                                          className="btn btn-light text-success fw-bold shadow-sm position-absolute start-50 translate-middle-x"
                                          style={{ bottom: '-15px', width: '80%', fontSize: '0.8rem', border: '1px solid #ddd' }}
                                          onClick={() => addToCart(item)}
                                        >
                                          ADD +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="fw-bold mb-4">Reviews</h4>
                {restaurant.reviews && restaurant.reviews.length > 0 ? (
                  restaurant.reviews.map((review, idx) => (
                    <div key={idx} className="card border-0 shadow-sm mb-3">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                              {review.user.charAt(0)}
                            </div>
                            <h6 className="mb-0 fw-bold">{review.user}</h6>
                          </div>
                          <span className="badge bg-success d-flex align-items-center">{review.rating} <i className="fas fa-star ms-1 small"></i></span>
                        </div>
                        <p className="text-muted mb-0">{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No reviews yet.</p>
                )}
              </motion.div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h4 className="fw-bold mb-3">About this place</h4>
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted small spacing-1">Address</h6>
                  <p className="text-dark">{restaurant.address}</p>
                </div>
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted small spacing-1">Cuisines</h6>
                  <p className="text-dark">{restaurant.cuisines.join(', ')}</p>
                </div>
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted small spacing-1">Average Cost</h6>
                  <p className="text-dark">₹{restaurant.avgCost} for two people (approx.)</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Cart Summary (Optional Sticky) */}
          <div className="col-lg-4 d-none d-lg-block">
            {cart.length > 0 && (
              <div className="card border-0 shadow-sm sticky-top" style={{ top: '150px' }}>
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Cart Empty?</h5>
                  <p className="text-muted small">Your cart contains {cart.reduce((a, c) => a + c.qty, 0)} items.</p>
                  <button className="btn btn-danger w-100 fw-bold" onClick={() => window.location.href = '/cart'}>Checkout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;
