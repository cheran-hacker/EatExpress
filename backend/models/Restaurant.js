// backend/models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cuisines: [{ type: String, required: true }],
    avgCost: { type: Number, required: true },
    rating: { type: Number, required: true },
    image: { type: String, required: true },

    // New fields for Real App experience
    address: { type: String, required: true },
    deliveryTime: { type: String, required: true }, // e.g. "30-40 min"
    isPromoted: { type: Boolean, default: false },
    reviews: [
      {
        user: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
      }
    ],
    aggregatedRating: {
      rating: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
