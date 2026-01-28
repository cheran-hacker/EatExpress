import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { motion } from 'framer-motion';
import TrackingMap from './TrackingMap';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [trackOrder, setTrackOrder] = useState(null); // Order being tracked
  const [editingOrder, setEditingOrder] = useState(null); // Order being edited (address)
  const [newAddress, setNewAddress] = useState('');

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get('/orders/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/orders/cancel/${orderId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Order Cancelled');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to cancel');
    }
  };

  const handleUpdateAddress = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/orders/address/${orderId}`, { address: newAddress }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Address Updated');
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update address');
    }
  };

  const startEditAddress = (order) => {
    setEditingOrder(order._id);
    setNewAddress(order.address);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PLACED': return 'fa-receipt';
      case 'ACCEPTED': return 'fa-check-double';
      case 'PREPARING': return 'fa-kitchen-set';
      case 'OUT_FOR_DELIVERY': return 'fa-motorcycle';
      case 'DELIVERED': return 'fa-house-circle-check';
      default: return 'fa-clock';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container my-5 relative">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 fw-bold"
      >
        Your Orders <span className="text-muted fs-4">({orders.length})</span>
      </motion.h2>

      {/* TRACKING MODAL */}
      {trackOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 overflow-auto" style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-5 shadow-2xl p-0 overflow-hidden position-relative"
              style={{ width: '100%', maxWidth: '550px', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              {/* HEADER WITH PULSE */}
              <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-800 m-0 d-flex align-items-center gap-2">
                    <span className="position-relative d-flex h-2 w-2" style={{ height: '10px', width: '10px' }}>
                      <span className="animate-ping position-absolute h-100 w-100 rounded-circle bg-success opacity-75" style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                      <span className="position-relative rounded-circle h-100 w-100 bg-success" style={{ height: '10px', width: '10px' }}></span>
                    </span>
                    Live Tracking
                  </h5>
                  <small className="text-muted">Order #{trackOrder._id.slice(-6).toUpperCase()}</small>
                </div>
                <button className="btn-close bg-light rounded-circle p-2" onClick={() => setTrackOrder(null)}></button>
              </div>

              {/* MAP SECTION */}
              <div className="position-relative">
                <TrackingMap
                  status={trackOrder.status}
                  createdAt={trackOrder.createdAt}
                  orderId={trackOrder._id}
                />
              </div>

              {/* STATUS STEPPER (Horizontal) */}
              <div className="p-4">
                <div className="d-flex justify-content-between position-relative mb-5 px-3">
                  <div className="position-absolute top-50 start-0 end-0 bg-light-subtle border-top" style={{ zIndex: 0, height: '2px', transform: 'translateY(-50%)' }}></div>
                  {['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, i) => {
                    const statusArray = ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                    const currentIndex = statusArray.indexOf(trackOrder.status);
                    const isActive = currentIndex === i;
                    const isCompleted = currentIndex >= i;
                    const isPassed = currentIndex > i;

                    return (
                      <div key={i} className="position-relative d-flex flex-column align-items-center" style={{ zIndex: 1, width: '20%' }}>
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-all position-relative ${isCompleted ? 'bg-primary text-white scale-110' : 'bg-white text-muted border'
                            }`}
                          style={{ width: '38px', height: '38px', transition: 'all 0.3s ease' }}
                        >
                          <i className={`fas ${getStatusIcon(step)} ${isActive ? 'fa-beat-fade' : ''}`} style={{ fontSize: '0.9rem' }}></i>
                          {isPassed && (
                            <div className="position-absolute top-0 end-0 bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                              style={{ width: '16px', height: '16px', transform: 'translate(25%, -25%)', border: '2px solid white' }}>
                              <i className="fas fa-check text-white" style={{ fontSize: '0.5rem' }}></i>
                            </div>
                          )}
                        </div>
                        <span className={`text-center mt-2 fw-800`} style={{ fontSize: '0.6rem', color: isCompleted ? '#2D2D2D' : '#A0A0A0' }}>
                          {step.replace(/_/g, ' ')}
                        </span>
                        {isPassed && (
                          <div className="d-flex align-items-center gap-1 mt-1">
                            <span className="text-success fw-bold" style={{ fontSize: '0.55rem' }}>Done</span>
                          </div>
                        )}
                        {isActive && (
                          <span className="text-primary fw-bold mt-1" style={{ fontSize: '0.55rem' }}>Now</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ADDRESS INFO CARD */}
                <div className="bg-light rounded-4 p-3 d-flex gap-3 align-items-start shadow-sm">
                  <div className="bg-white rounded-3 p-2 shadow-sm">
                    <i className="fas fa-location-dot text-primary"></i>
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <small className="text-muted text-uppercase fw-800" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Delivery Address</small>
                    <p className="m-0 fw-bold text-dark text-truncate small">{trackOrder.address}</p>
                  </div>
                </div>

                {/* BOTTOM ACTION */}
                <div className="mt-4 pt-2">
                  <button className="btn btn-primary w-100 py-3 rounded-4 fw-800 shadow-sm border-0 d-flex align-items-center justify-content-center gap-2"
                    style={{ background: 'linear-gradient(45deg, #FF3D3D, #FF6B3D)' }}>
                    <i className="fas fa-headset"></i> Need Help? Chat with Support
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div >
      )}

      {
        orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5 glass-card"
          >
            <img
              src="https://b.zmtcdn.com/web_assets/b40b97e677bc7b2caea71541050683461657355127.png"
              alt="No Orders"
              className="mb-4"
              style={{ width: 200, opacity: 0.8 }}
            />
            <h4 className="fw-bold text-dark">No orders yet</h4>
            <p className="text-muted mb-4">It seems you haven't ordered any delicious food yet.</p>
            <a href="/" className="btn btn-primary px-4 py-2 fw-bold">Start Ordering</a>
          </motion.div>
        ) : (
          <div className="row g-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="col-lg-10 mx-auto"
              >
                <div className="card glass-card border-0 p-0 overflow-hidden">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-3">
                      <div className="d-flex gap-3 w-100">
                        <img
                          src={order.restaurantId?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'}
                          alt="Restaurant"
                          className="rounded-3 object-fit-cover shadow-sm flex-shrink-0"
                          style={{ width: 60, height: 60 }}
                        />
                        <div className="overflow-hidden w-100">
                          <h5 className="fw-bold mb-1 text-dark text-truncate">{order.restaurantId?.name || 'Unknown Restaurant'}</h5>
                          {editingOrder === order._id ? (
                            <div className="d-flex gap-2 mt-1">
                              <input
                                className="form-control form-control-sm"
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                              />
                              <button className="btn btn-sm btn-success text-nowrap" onClick={() => handleUpdateAddress(order._id)}>Save</button>
                              <button className="btn btn-sm btn-secondary text-nowrap" onClick={() => setEditingOrder(null)}>Cancel</button>
                            </div>
                          ) : (
                            <p className="text-muted small mb-0 d-flex align-items-center flex-wrap">
                              <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>{order.address}</span>
                              {order.status === 'PLACED' && (
                                <button className="btn btn-link py-0 px-2 text-decoration-none small text-nowrap" onClick={() => startEditAddress(order)}>
                                  <i className="fas fa-pencil-alt"></i> Edit
                                </button>
                              )}
                            </p>
                          )}
                          <small className="text-muted d-block mt-1" style={{ fontSize: '0.8rem' }}>ORDER #{order._id.slice(-6).toUpperCase()} | {formatDate(order.createdAt)}</small>
                        </div>
                      </div>
                      <div className="text-end align-self-start flex-shrink-0">
                        <span className={`badge px-3 py-2 rounded-pill ${order.status === 'DELIVERED' ? 'bg-success-subtle text-success' :
                          order.status === 'CANCELLED' ? 'bg-danger-subtle text-danger' :
                            'bg-primary-subtle text-primary'
                          }`}>
                          {order.status === 'PLACED' ? 'Order Placed' : order.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-light rounded-3 p-3 mb-3">
                      {order.items.map((it, i) => (
                        <div key={i} className="d-flex justify-content-between align-items-center mb-2 last-mb-0">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-circle-check text-success small me-2 opacity-50"></i>
                            <span className="fw-medium text-dark">{it.quantity} x {it.name}</span>
                          </div>
                          <span className="text-muted">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                      <div className="border-top mt-2 pt-2 d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Total Paid</span>
                        <span className="fw-bold fs-5 text-dark">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-between align-items-center">
                      <div>
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                          <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleCancel(order._id)}>
                            <i className="fas fa-times me-1"></i> Cancel Order
                          </button>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        {order.status !== 'CANCELLED' && (
                          <button
                            className="btn btn-outline-secondary px-3 fw-bold"
                            onClick={() => setTrackOrder(order)}
                          >
                            Track Order
                          </button>
                        )}
                        <button className="btn btn-primary px-3 fw-bold shadow-sm">
                          <i className="fas fa-redo me-2"></i>Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      }
    </div >
  );
};

export default Orders;
