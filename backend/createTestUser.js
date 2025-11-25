require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
    try {
        // Get MongoDB URI from environment
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('MONGODB_URI not found in .env file');
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB\n');

        // Test user credentials
        const testEmail = 'test@example.com';
        const testPassword = 'Test123456';
        const testName = 'Test User';

        // Check if user already exists
        let user = await User.findOne({ email: testEmail });
        
        if (user) {
            console.log('Test user already exists. Deleting...');
            await User.deleteOne({ email: testEmail });
        }

        // Create new test user
        console.log('Creating test user...');
        user = await User.create({
            fullName: testName,
            email: testEmail,
            password: testPassword
        });

        console.log('✓ Test user created successfully!\n');
        console.log('Login Credentials:');
        console.log('==================');
        console.log(`Email: ${testEmail}`);
        console.log(`Password: ${testPassword}`);
        console.log('==================\n');

        // Test login immediately
        console.log('Testing login...');
        try {
            const loginUser = await User.findByCredentials(testEmail, testPassword);
            console.log('✓ Login test successful!');
            console.log(`Logged in as: ${loginUser.fullName}`);
        } catch (error) {
            console.log('✗ Login test failed!');
            console.log('Error:', error.message);
        }

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
