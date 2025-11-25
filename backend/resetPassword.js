const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'umerrais006@gmail.com';
        const newPassword = 'password123';

        // Find user
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ User not found. Please signup first.');
            process.exit(1);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        console.log('✅ Password reset successfully!');
        console.log(`Email: ${email}`);
        console.log(`New Password: ${newPassword}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetPassword();
