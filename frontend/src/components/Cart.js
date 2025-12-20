import React, { useState } from 'react';
import axios from 'axios';

import { motion } from 'framer-motion';

const Cart = ({ cart, setCart }) => {
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'COD',
  });

  const total = cart.reduce(
    (sum, i) => sum + (i.price || 0) * (i.qty || i.quantity || 1),
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateQuantity = (itemId, change) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item._id === itemId) {
          const newQty = (item.qty || item.quantity || 1) + change;
          return { ...item, qty: newQty, quantity: newQty };
        }
        return item;
      }).filter((item) => (item.qty || item.quantity) > 0);
    });
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0: Start, 1: Connecting, 2: Verifying, 3: Success

  const processingSteps = [
    { text: "Connecting to Secure Gateway...", icon: "fas fa-lock" },
    { text: "Verifying Payment Details...", icon: "fas fa-file-invoice-dollar" },
    { text: "Confirming Order with Restaurant...", icon: "fas fa-utensils" },
    { text: "Payment Successful!", icon: "fas fa-check-circle" }
  ];

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert('Cart is empty');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.id) return alert('Login first to place order');

    const restaurantId = cart[0].restaurantId;
    const items = cart.map((item) => ({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.qty || item.quantity || 1,
    }));

    const finalAmount = total + 40 + Math.round(total * 0.05);

    // TRIGGER PROCESSING SIMULATION
    setIsProcessing(true);
    setProcessingStep(0);

    // Step 1: Connecting
    setTimeout(() => setProcessingStep(1), 1000);

    // Step 2: Verifying
    setTimeout(() => setProcessingStep(2), 3000);

    // Step 3: Finish & Call API
    setTimeout(async () => {
      setProcessingStep(3);

      // Execute Actual Logic after delay
      try {
        await executeOrderPlacement(user, token, restaurantId, items, finalAmount);
      } catch (err) {
        setIsProcessing(false);
        console.error(err);
        alert("Order Failed");
      }
    }, 5000);
  };

  const executeOrderPlacement = async (user, token, restaurantId, items, finalAmount) => {
    // 1. COD Flow
    if (form.paymentMethod === 'COD') {
      const res = await axios.post(
        '/orders',
        {
          userId: user.id,
          restaurantId,
          items,
          totalAmount: finalAmount,
          address: form.address,
          paymentMethod: form.paymentMethod,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      finishOrder(res.data._id);
      return;
    }

    // 2. Razorpay / Mock Flow
    const { data: keyData } = await axios.get('/payment/key');
    const { data: orderData } = await axios.post('/payment/create-order', {
      amount: finalAmount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    // MOCK MODE HANDLER specifically for the delay flow
    if (keyData.isMock || orderData.isMock) {
      const res = await axios.post(
        '/orders',
        {
          userId: user.id,
          restaurantId,
          items,
          totalAmount: finalAmount,
          address: form.address,
          paymentMethod: form.paymentMethod,
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          paymentId: `mock_pay_${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      finishOrder(res.data._id);
      return;
    }

    // Real Razorpay (Needs user interaction, so we pause processing UI or handle it differently. 
    // For now assuming Mock Mode or COD is primary focus of user request)
    setIsProcessing(false); // Hide loader to show Razorpay Popup

    const options = {
      key: keyData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "EatsExpress",
      description: "Food Delivery",
      order_id: orderData.id,
      handler: async function (response) {
        try {
          const verifyRes = await axios.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyRes.data.success) {
            const res = await axios.post(
              '/orders',
              {
                userId: user.id,
                restaurantId,
                items,
                totalAmount: finalAmount,
                address: form.address,
                paymentMethod: form.paymentMethod,
                customerName: form.customerName,
                email: form.email,
                phone: form.phone,
                paymentId: response.razorpay_payment_id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Payment Successful! Order placed! ID: ${res.data._id}`);
            setCart([]);
          } else {
            alert("Payment verification failed");
          }
        } catch (err) {
          console.error(err);
          alert("Payment Verification Error");
        }
      },
      prefill: {
        name: form.customerName,
        email: form.email,
        contact: form.phone
      },
      theme: {
        color: "#ff4757"
      }
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response) {
      alert(response.error.description);
    });
    rzp1.open();
  };

  const finishOrder = (orderId) => {
    // Keep "Success" state for a moment
    setTimeout(() => {
      setIsProcessing(false);
      setCart([]);
      window.location.href = '/orders'; // Auto redirect
    }, 2000);
  };


  return (
    <div className="container my-5 position-relative">

      {/* PAYMENT PROCESSING OVERLAY */}
      {isProcessing && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white" style={{ zIndex: 2000 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="d-inline-block"
              >
                {processingStep < 3 ? (
                  <i className="fas fa-circle-notch fa-4x text-primary"></i>
                ) : (
                  <i className="fas fa-check-circle fa-5x text-success"></i>
                )}
              </motion.div>
            </div>

            <h3 className="fw-bold mb-3">Processing your Order...</h3>

            <div className="d-flex flex-column gap-3 align-items-start bg-light p-4 rounded-4 shadow-sm" style={{ minWidth: '300px' }}>
              {processingSteps.map((step, idx) => (
                <div key={idx} className={`d-flex align-items-center gap-3 ${idx <= processingStep ? 'opacity-100' : 'opacity-25'}`}>
                  <i className={`${step.icon} ${idx <= processingStep ? 'text-primary' : 'text-muted'}`}></i>
                  <span className={`fw-medium ${idx <= processingStep ? 'text-dark' : 'text-muted'}`}>{step.text}</span>
                  {idx < processingStep && <i className="fas fa-check text-success ms-auto"></i>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 fw-bold"
      >
        Your Cart <span className="text-primary">({cart.length})</span>
      </motion.h2>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-5 glass-card"
        >
          <i className="fas fa-shopping-basket fa-4x text-muted mb-3 opacity-50"></i>
          <p className="text-muted fs-5">Your cart is empty.</p>
          <a href="/" className="btn btn-primary mt-2">Start Ordering</a>
        </motion.div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="card glass-card border-0 p-4"
            >
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60 }}>
                      <i className="fas fa-utensils text-secondary"></i>
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{item.name}</h5>
                      <div className="d-flex align-items-center mt-2">
                        <button
                          className="btn btn-sm btn-outline-danger px-2 me-2"
                          onClick={() => updateQuantity(item._id, -1)}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="fw-bold fs-6 mx-2">{item.qty || item.quantity || 1}</span>
                        <button
                          className="btn btn-sm btn-outline-success px-2 ms-2"
                          onClick={() => updateQuantity(item._id, 1)}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="fw-bold fs-5">₹{item.price}</span>
                </div>
              ))}
              <div className="mt-4 pt-3 border-top">
                <div className="d-flex justify-content-between mb-2 text-muted">
                  <span>Item Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-muted">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span>Govt Taxes (5%)</span>
                  <span>₹{Math.round(total * 0.05)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <h4 className="fw-bold m-0">To Pay</h4>
                  <h4 className="fw-bold text-primary m-0">₹{total + 40 + Math.round(total * 0.05)}</h4>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-lg-5">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card glass-card border-0 p-4"
            >
              <h4 className="mb-4 fw-bold border-bottom pb-2">Checkout Details</h4>
              <form onSubmit={placeOrder}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Full Name</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Email</label>
                  <input
                    type="email"
                    className="form-control bg-light border-0 py-2"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Phone</label>
                  <input
                    className="form-control bg-light border-0 py-2"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Delivery Address</label>
                  <textarea
                    className="form-control bg-light border-0 py-2"
                    name="address"
                    rows="3"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">Payment Method</label>
                  <select
                    className="form-select bg-light border-0 py-2"
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="UPI">UPI / PhonePe / GPay</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow-sm" type="submit">
                  Place Order <i className="fas fa-check-circle ms-2"></i>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
