import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    deliveryPrice: { type: Number, required: true },
    deliveryTime: { type: Number, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// force collection name = "restaurants"
const Restaurant = mongoose.model('Restaurant', restaurantSchema, 'restaurants');

export default Restaurant;
