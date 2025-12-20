// backend/routes/restaurantRoutes.js
import express from 'express';
import Restaurant from '../models/restaurantModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
