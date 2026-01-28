const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const deleteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food_delivery_app');
        console.log('Connected to DB');

        const email = 'gokul@gmail.com';
        const result = await User.deleteOne({ email });

        if (result.deletedCount > 0) {
            console.log(`User ${email} deleted successfully.`);
        } else {
            console.log(`User ${email} not found.`);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

deleteUser();
