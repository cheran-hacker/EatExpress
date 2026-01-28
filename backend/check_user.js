const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food_delivery_app'); // Adjust DB URI if needed
        console.log('Connected to DB');

        const email = 'gokul@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User NOT found with email:', email);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkUser();
