import express from 'express';
import Restaurant from '../models/restaurantModel.js';
import data from '../data.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  try {
    await Restaurant.deleteMany({});
    const createdRestaurants = await Restaurant.insertMany(data.restaurants);
    res.json({
      ok: true,
      restaurants: createdRestaurants.length,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

export default seedRouter;
