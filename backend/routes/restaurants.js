// backend/routes/restaurants.js
const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// GET /api/restaurants → all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (err) {
    console.error('restaurants list error', err);
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/restaurants/:id → single restaurant details
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    console.error('restaurant detail error', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).json({ msg: err.message });
  }
});

// GET /api/restaurants/:id/menu → menu for restaurant
router.get('/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;
    const items = await MenuItem.find({ restaurantId: id });
    res.json(items);
  } catch (err) {
    console.error('menu route error', err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
