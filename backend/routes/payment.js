const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get Razorpay Key
router.get('/key', (req, res) => {
    const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('test_your_key');
    res.json({ key: process.env.RAZORPAY_KEY_ID, isMock });
});

// Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        // Mock Mode Check
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('test_your_key')) {
            return res.json({
                id: `order_mock_${Date.now()}`,
                currency,
                amount: amount * 100,
                status: 'created',
                isMock: true
            });
        }

        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Error Full:', JSON.stringify(error, null, 2));
        res.status(500).json({ msg: 'Something went wrong with payment init', error: error.message });
    }
});

// Verify Payment
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

        if (isMock) {
            return res.json({ msg: 'Payment verified (Mock)', success: true });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ msg: 'Payment verified successfully', success: true });
        } else {
            res.status(400).json({ msg: 'Invalid signature', success: false });
        }
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});

module.exports = router;
