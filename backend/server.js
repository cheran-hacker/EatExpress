// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));

// SEED – run once after server start
app.get('/api/seed', async (req, res) => {
  try {
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({}); // Clear old orders to prevent "Unknown Restaurant" error

    const restaurants = await Restaurant.insertMany([
      {
        name: 'Spice Junction',
        cuisines: ['South Indian', 'Chinese'],
        avgCost: 300,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop',
        address: '12, Main St, Avinashi',
        deliveryTime: '30-40 min',
        isPromoted: true,
        reviews: [
          { user: 'Rahul', rating: 5, comment: 'Best dosa in town!', date: new Date() },
          { user: 'Sneha', rating: 4, comment: 'Sambar was slightly spicy', date: new Date() }
        ],
        aggregatedRating: { rating: 4.5, count: 120 }
      },
      {
        name: 'Biryani House',
        cuisines: ['Biryani', 'Mughlai'],
        avgCost: 400,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop',
        address: 'Opposite Bus Stand, Avinashi',
        deliveryTime: '45-55 min',
        isPromoted: false,
        reviews: [
          { user: 'Amit', rating: 5, comment: 'Authentic Hyderabadi taste', date: new Date() }
        ],
        aggregatedRating: { rating: 4.3, count: 85 }
      },
      {
        name: 'Pizza Palace',
        cuisines: ['Italian', 'Fast Food'],
        avgCost: 500,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
        address: 'Shop 5, City Mall, Avinashi',
        deliveryTime: '25-35 min',
        isPromoted: true,
        reviews: [
          { user: 'John', rating: 5, comment: 'Cheesy and delicious', date: new Date() }
        ],
        aggregatedRating: { rating: 4.6, count: 200 }
      },
      {
        name: 'Burger Hub',
        cuisines: ['Fast Food', 'Burgers'],
        avgCost: 250,
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
        address: 'New Market Road, Avinashi',
        deliveryTime: '20-30 min',
        isPromoted: false,
        reviews: [],
        aggregatedRating: { rating: 4.2, count: 50 }
      },
      {
        name: 'China Bowl',
        cuisines: ['Chinese', 'Asian'],
        avgCost: 350,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
        address: 'Near Railway Station, Avinashi',
        deliveryTime: '35-45 min',
        isPromoted: false,
        reviews: [],
        aggregatedRating: { rating: 4.4, count: 90 }
      },
    ]);

    const [spiceJunction, biryaniHouse, pizzaPalace, burgerHub, chinaBowl] =
      restaurants;

    const menuItems = [
      // Spice Junction
      {
        restaurantId: spiceJunction._id,
        name: 'Idli Sambar',
        price: 80,
        category: 'Breakfast',
        veg: true,
        image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80',
        description: 'Soft steamed rice cakes served with spicy lentil soup',
      },
      {
        restaurantId: spiceJunction._id,
        name: 'Masala Dosa',
        price: 120,
        category: 'Breakfast',
        veg: true,
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80',
        description: 'Crispy crepe filled with spiced potato mash',
      },
      {
        restaurantId: spiceJunction._id,
        name: 'Medu Vada',
        price: 60,
        category: 'Snacks',
        veg: true,
        image: 'https://images.unsplash.com/photo-1626132646529-5aa2d2256df2?w=500&q=80',
        description: 'Deep fried savory donut',
      },

      // Biryani House
      {
        restaurantId: biryaniHouse._id,
        name: 'Chicken Dum Biryani',
        price: 240,
        category: 'Bestseller',
        veg: false,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
        description: 'Slow cooked aromatic rice with tender chicken pieces',
      },
      {
        restaurantId: biryaniHouse._id,
        name: 'Paneer Biryani',
        price: 200,
        category: 'Main Course',
        veg: true,
        image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?q=80&w=800&auto=format&fit=crop',
        description: 'Flavorful rice cooked with marinated cottage cheese',
      },
      {
        restaurantId: biryaniHouse._id,
        name: 'Chicken 65',
        price: 180,
        category: 'Starters',
        veg: false,
        image: 'https://images.unsplash.com/photo-1626776420079-95e2475cadb6?q=80&w=800&auto=format&fit=crop',
        description: 'Spicy deep fried chicken chunks',
      },

      // Pizza Palace
      {
        restaurantId: pizzaPalace._id,
        name: 'Margherita',
        price: 250,
        category: 'Classic Pizzas',
        veg: true,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
        description: 'Classic cheese and tomato sauce',
      },
      {
        restaurantId: pizzaPalace._id,
        name: 'Pepperoni Feast',
        price: 350,
        category: 'Premium Pizzas',
        veg: false,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
        description: 'Overloaded with pepperoni slices',
      },
      {
        restaurantId: pizzaPalace._id,
        name: 'Garlic Bread',
        price: 120,
        category: 'Sides',
        veg: true,
        image: 'https://images.unsplash.com/photo-1573140247632-f84660f67126?q=80&w=800&auto=format&fit=crop',
        description: 'Butter garlic toasted bread sticks',
      },

      // Burger Hub
      {
        restaurantId: burgerHub._id,
        name: 'Crispy Chicken Burger',
        price: 180,
        category: 'Burgers',
        veg: false,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
        description: 'Fried chicken patty with mayo and lettuce',
      },
      {
        restaurantId: burgerHub._id,
        name: 'Veg Whopper',
        price: 160,
        category: 'Burgers',
        veg: true,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
        description: 'Double veg patty with cheese slice',
      },
      {
        restaurantId: burgerHub._id,
        name: 'French Fries',
        price: 90,
        category: 'Sides',
        veg: true,
        image: 'https://images.unsplash.com/photo-1630360430435-2c1a646c03d7?q=80&w=800&auto=format&fit=crop',
        description: 'Salted crispy potato fries',
      },

      // China Bowl
      {
        restaurantId: chinaBowl._id,
        name: 'Hakka Noodles',
        price: 180,
        category: 'Noodles',
        veg: true,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d72b7?q=80&w=800&auto=format&fit=crop',
        description: 'Wok tossed noodles with lots of veggies',
      },
      {
        restaurantId: chinaBowl._id,
        name: 'Manchurian Gravy',
        price: 200,
        category: 'Main Course',
        veg: true,
        image: 'https://images.unsplash.com/photo-1626776420079-95e2475cadb6?q=80&w=800&auto=format&fit=crop',
        description: 'Veg balls in spicy soya garlic sauce',
      },
      {
        restaurantId: chinaBowl._id,
        name: 'Spring Rolls',
        price: 150,
        category: 'Appetizers',
        veg: true,
        image: 'https://images.unsplash.com/photo-1544025162-d7669d681283?q=80&w=800&auto=format&fit=crop',
        description: 'Crispy rolls filled with vegetables',
      },
    ];

    await MenuItem.insertMany(menuItems);

    res.json({
      ok: true,
      restaurants: restaurants.length,
      items: menuItems.length,
    });
  } catch (err) {
    console.error('seed error', err);
    res.status(500).json({ msg: err.message });
  }
});

// socket.io (optional)
io.on('connection', (socket) => {
  console.log('socket connected');
  socket.on('disconnect', () => console.log('socket disconnected'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ msg: 'Not found' });
});

// start after DB connect
connectDB().then(() => {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
    console.log('Seed once: http://localhost:5000/api/seed');
  });
});
