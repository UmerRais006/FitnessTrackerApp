# 🏋️ My Fitness App

A comprehensive fitness tracking mobile application built with React Native and Expo, featuring workout scheduling, nutrition tracking, step counting, and personalized fitness goals.

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo)
![NativeWind](https://img.shields.io/badge/NativeWind-4.2.1-38BDF8)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)

## 📱 Features

### 🔐 Authentication
- **User Registration & Login** - Secure authentication with JWT tokens
- **Profile Management** - Edit profile with custom profile pictures (base64 storage)
- **Password Reset** - Email-based password recovery

### 🏃 Activity Tracking
- **Step Counter** - Real-time step tracking using device sensors
- **Distance Calculation** - Automatic distance conversion from steps
- **Calorie Tracking** - Estimated calorie burn based on activity
- **Daily Goals** - Set and track personalized distance goals with visual progress indicators

### 💪 Workout Management
- **Schedule Workouts** - Plan workouts for specific days and times
- **Workout Validation** - Complete workouts only on scheduled days after the scheduled time
- **Recent Activity** - View completed workout history
- **Workout Timer** - Built-in timer for workout sessions

### 🥗 Nutrition Tracking
- **Meal Planning** - Track breakfast, lunch, dinner, and snacks
- **Calorie Monitoring** - Log and monitor daily caloric intake
- **Meal History** - View nutrition logs and meal details

### ⏱️ Timer & Tools
- **Workout Timer** - Countdown timer for exercises
- **Quick Actions** - Easy access to key features from the home screen

### 🎨 User Interface
- **Modern Design** - Clean, intuitive interface with NativeWind styling
- **Dark/Light Themes** - Orange and black color scheme
- **Responsive Layout** - Optimized for various screen sizes
- **Smooth Animations** - Engaging user experience with haptic feedback

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0) - Development platform and tooling
- **Expo Router** (6.0) - File-based routing
- **NativeWind** (4.2.1) - Tailwind CSS for React Native
- **TypeScript** (5.9.2) - Type-safe development
- **AsyncStorage** - Local data persistence
- **Expo Sensors** - Pedometer and activity tracking
- **React Native SVG** - Custom graphics and progress indicators

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** (4.18.2) - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** (8.0.3) - MongoDB object modeling
- **JWT** (9.0.2) - Authentication tokens
- **bcryptjs** (2.4.3) - Password hashing
- **Nodemailer** (6.9.7) - Email functionality

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **MongoDB** (local or cloud instance)
- **iOS Simulator** or **Android Emulator** (or physical device with Expo Go)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/UmerRais006/FitnessTrackerApp.git
cd My-Fitness-App
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fitness-app
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitness-app

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### 5. Set Up MongoDB

#### Option A: Local MongoDB
```bash
# Install MongoDB locally and start the service
mongod --dbpath /path/to/data/directory
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions.

## 🎯 Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:3000`

### Start the Expo Development Server
In a new terminal:
```bash
npm start
```

### Run on Specific Platform
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
My-Fitness-App/
├── app/                          # Application screens (Expo Router)
│   ├── index.tsx                 # Welcome screen
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── home.tsx                  # Home dashboard
│   ├── profile.tsx               # User profile
│   ├── workout.tsx               # Workout scheduling
│   ├── nutrition.tsx             # Nutrition tracking
│   ├── timer.tsx                 # Workout timer
│   ├── WorkoutContext.tsx        # Workout state management
│   └── _layout.tsx               # Root layout
├── backend/                      # Backend API
│   ├── config/                   # Configuration files
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Auth middleware
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── server.js                 # Express server
│   └── .env                      # Environment variables
├── assets/                       # Images and static files
├── components/                   # Reusable components
├── constants/                    # App constants
├── context/                      # React context providers
├── hooks/                        # Custom React hooks
├── services/                     # API services
├── global.css                    # Global styles
├── tailwind.config.js            # Tailwind configuration
├── app.json                      # Expo configuration
└── package.json                  # Dependencies
```

## 🔑 Key Features Explained

### Step Tracking
The app uses the device's pedometer sensor to track steps in real-time. Steps are converted to:
- **Distance**: `steps × 0.0008 km`
- **Calories**: `steps × 0.04 kcal`

### Workout Validation
Workouts can only be marked as complete if:
1. They are scheduled for the current day
2. The scheduled time has already passed

This ensures users follow their planned workout schedule.

### Profile Pictures
Profile pictures are stored as base64-encoded strings in MongoDB, eliminating the need for separate file storage.

### Data Persistence
- **Local Storage**: AsyncStorage for user sessions and local data
- **Cloud Storage**: MongoDB for user accounts, workouts, and nutrition data

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Express-validator for API inputs

## 🎨 Styling

The app uses **NativeWind** (Tailwind CSS for React Native) for styling:
- Utility-first CSS approach
- Consistent design system
- Responsive layouts
- Custom color palette (orange/black theme)

## 📱 Supported Platforms

- ✅ iOS
- ✅ Android
- ⚠️ Web (limited functionality - sensors not available)

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:3000/api/auth/test

# Verify MongoDB connection
mongosh "your-mongodb-uri"
```

### Expo Issues
```bash
# Clear cache
npx expo start -c

# Reset project
npm run reset-project
```

### Step Counter Not Working
- Ensure physical device is used (simulators don't have pedometer)
- Grant motion & fitness permissions in device settings

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password` - Request password reset
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Workouts
- `GET /api/workouts` - Get user workouts (protected)
- `POST /api/workouts` - Create workout (protected)
- `PUT /api/workouts/:id` - Update workout (protected)
- `DELETE /api/workouts/:id` - Delete workout (protected)

### Nutrition
- `GET /api/nutrition` - Get nutrition logs (protected)
- `POST /api/nutrition` - Log meal (protected)
- `DELETE /api/nutrition/:id` - Delete meal log (protected)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Umer Rais**
- GitHub: [@UmerRais006](https://github.com/UmerRais006)
- Repository: [FitnessTrackerApp](https://github.com/UmerRais006/FitnessTrackerApp)

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community
- NativeWind for Tailwind CSS integration
- MongoDB for database solutions

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/UmerRais006/FitnessTrackerApp/issues)
- Check existing documentation in the repository

---

**Built with ❤️ using React Native and Expo**
