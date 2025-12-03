# FIT PRO - Fitness Tracking Mobile Application

A comprehensive fitness tracking mobile application built with React Native (Expo) and Node.js backend. Track your workouts, monitor daily activity, manage nutrition, and achieve your fitness goals.

![App Name](./assets/images/icon.png)

---

## 📱 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [App Screens](#app-screens)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### User Authentication
- **Secure Registration & Login** - Email and password-based authentication
- **JWT Token Management** - Secure session handling with automatic token refresh
- **Profile Management** - Update profile picture (base64), name, and personal information
- **Persistent Sessions** - Auto-login on app restart

### Workout Management
- **Weekly Workout Scheduler** - Plan workouts for each day of the week
- **Time-based Scheduling** - Set specific times for each workout
- **Workout Validation** - Can only complete workouts on the scheduled day after the scheduled time
- **Workout History** - Track last 10 completed workouts
- **User-specific Data** - Each user has their own workout schedule

### Activity Tracking
- **Step Counter** - Real-time step tracking using device pedometer
- **Distance Calculation** - Automatic conversion of steps to kilometers
- **Calorie Tracking** - Estimated calories burned based on steps
- **Daily Goals** - Set and track custom distance goals
- **Progress Visualization** - Circular progress indicators

### Nutrition Tracking
- **Meal Planning** - Track breakfast, lunch, dinner, and snacks
- **Calorie Counting** - Monitor daily calorie intake
- **Meal History** - View recent meals and nutritional information

### Timer & Tools
- **Workout Timer** - Countdown timer for timed exercises
- **Rest Timer** - Track rest periods between sets

### UI/UX Features
- **Modern Design** - Clean black and white theme
- **Responsive Layout** - Optimized for all screen sizes
- **Smooth Animations** - Polished user experience
- **Dark Mode Ready** - Consistent dark/light contrast

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **Sensors**: Expo Sensors (Pedometer)
- **Icons**: Expo Vector Icons (Ionicons)
- **Image Handling**: Expo Image Picker

### Backend (API Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs for hashing
- **Email**: Nodemailer for password reset emails
- **CORS**: Enabled for cross-origin requests

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **API Testing**: Can use Postman or Thunder Client
- **Development Server**: Nodemon for auto-restart

---

## 📁 Project Structure

```
My-Fitness-App/
├── app/                          # Frontend - React Native App
│   ├── _layout.tsx              # Root layout with WorkoutProvider
│   ├── index.tsx                # Welcome/Landing screen
│   ├── login.tsx                # Login screen
│   ├── signup.tsx               # Signup screen
│   ├── home.tsx                 # Main dashboard/home screen
│   ├── profile.tsx              # User profile screen
│   ├── workout.tsx              # Workout scheduler screen
│   ├── nutrition.tsx            # Nutrition tracking screen
│   ├── timer.tsx                # Workout timer screen
│   └── WorkoutContext.tsx       # Global workout state management
│
├── backend/                      # Backend - Node.js API
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── models/
│   │   └── User.js              # User database schema
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── server.js                # Express server entry point
│   ├── package.json             # Backend dependencies
│   └── .env                     # Environment variables
│
├── services/                     # Frontend Services
│   ├── api.ts                   # Axios API client configuration
│   └── authAPI.ts               # Authentication API calls
│
├── components/                   # Reusable React components
│   └── NotificationDebugger.tsx # (Debug tool - not in use)
│
├── assets/                       # Static assets
│   └── images/                  # App images and icons
│
├── app.json                      # Expo configuration
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # TailwindCSS configuration
└── README.md                     # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud) or local installation
- **Expo Go** app on your mobile device (for testing)
- **Git** (optional, for version control)

### Step 1: Clone the Repository
```bash
cd C:\Users\Hp\Documents\MobileApplicationDevelopment
cd My-Fitness-App
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/fitness-app

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### Step 5: Update API URL

In `services/api.ts`, update the `API_URL` to match your computer's IP address:

```typescript
// Find your IP: Run 'ipconfig' in terminal and look for IPv4 Address
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
// Example: 'http://192.168.100.11:5000/api'
```

---

## ▶️ Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
```
✅ Server should start on `http://localhost:5000`

### Start the Frontend (Expo)
In a new terminal:
```bash
npm run dev
# or
npx expo start
```

### Run on Physical Device
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal
3. App will load on your device

### Run on Emulator
- **Android**: Press `a` in the Expo terminal
- **iOS**: Press `i` in the Expo terminal (Mac only)

---

## 🔌 API Documentation

### Base URL
```
http://YOUR_IP:5000/api
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": null
  }
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register

#### 3. Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "base64_encoded_image_string"
}
```

#### 4. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fullName": "John Updated",
  "profilePic": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

---

## 📱 App Screens

### 1. Welcome Screen (`index.tsx`)
- **Purpose**: Landing page with app branding
- **Features**: 
  - Auto-login if valid token exists
  - Navigation to Login/Signup
  - Background image with gradient overlay

### 2. Login Screen (`login.tsx`)
- **Purpose**: User authentication
- **Features**:
  - Email and password input
  - Form validation
  - Error handling
  - Navigation to signup
  - Auto-redirect to home on success

### 3. Signup Screen (`signup.tsx`)
- **Purpose**: New user registration
- **Features**:
  - Full name, email, password inputs
  - Password confirmation
  - Validation (email format, password match)
  - Auto-login after successful registration

### 4. Home Screen (`home.tsx`)
- **Purpose**: Main dashboard
- **Features**:
  - Step counter with real-time updates
  - Distance tracking (km)
  - Calorie counter
  - Daily goal progress (circular indicator)
  - Today's scheduled workouts
  - Recent completed workouts (last 10)
  - Quick action buttons (Workout, Nutrition, Timer)
  - Profile picture display
  - Logout functionality

### 5. Workout Screen (`workout.tsx`)
- **Purpose**: Weekly workout scheduler
- **Features**:
  - 7-day week calendar view
  - Add workouts to specific days
  - Set workout time and description
  - Edit existing workouts
  - Delete workouts
  - Complete workouts (with validation)
  - View all scheduled workouts by day
  - User-specific workout storage

**Workout Validation Rules:**
- Can only complete workouts scheduled for TODAY
- Can only complete after the scheduled time has passed
- Shows time remaining if trying to complete early

### 6. Nutrition Screen (`nutrition.tsx`)
- **Purpose**: Track daily meals and calories
- **Features**:
  - Add meals (Breakfast, Lunch, Dinner, Snacks)
  - Calorie tracking per meal
  - Daily calorie total
  - Meal history
  - Delete meals

### 7. Timer Screen (`timer.tsx`)
- **Purpose**: Workout countdown timer
- **Features**:
  - Set custom duration
  - Start/Pause/Reset controls
  - Visual countdown display
  - Sound notification on completion

### 8. Profile Screen (`profile.tsx`)
- **Purpose**: User profile management
- **Features**:
  - View/edit profile picture
  - Update full name
  - Display email (read-only)
  - Image picker (camera or gallery)
  - Base64 image encoding
  - Save changes to backend

---

## 🗄 Database Schema

### User Model
```javascript
{
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePic: {
    type: String,  // Base64 encoded image
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### Local Storage (AsyncStorage)

#### Workouts
```typescript
Key: `workouts_${userEmail}`
Value: {
  "Monday": [
    {
      "time": "2025-11-27T10:00:00.000Z",
      "description": "Morning Cardio",
      "notificationScheduled": false
    }
  ],
  "Tuesday": [...],
  // ... other days
}
```

#### Completed Workouts
```typescript
Key: `completed_workouts_${userEmail}`
Value: [
  {
    "description": "Morning Cardio",
    "scheduledTime": "2025-11-27T10:00:00.000Z",
    "completedTime": "2025-11-27T10:05:00.000Z",
    "day": "Monday"
  }
  // ... up to 10 recent workouts
]
```

#### User Session
```typescript
Key: "authToken"
Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

Key: "user"
Value: {
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "base64_string"
}
```

#### Daily Goal
```typescript
Key: "dailyGoal"
Value: "5"  // kilometers
```

---

## 🔧 Environment Variables

### Backend `.env` File

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/fitness` |
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-min-32-chars` |
| `EMAIL_USER` | Email for password reset | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your-app-password` |

### Frontend Configuration

**File**: `services/api.ts`
```typescript
const API_URL = 'http://192.168.100.11:5000/api';
```
Update this with your computer's IP address (find using `ipconfig` on Windows or `ifconfig` on Mac/Linux).

---

## 🐛 Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Check MongoDB URI in `.env`
- Ensure MongoDB Atlas cluster is running
- Whitelist your IP in MongoDB Atlas Network Access

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Frontend Issues

#### Cannot Connect to Backend
**Solution**:
1. Check backend is running (`npm run dev` in backend folder)
2. Verify `API_URL` in `services/api.ts` matches your IP
3. Ensure phone and computer are on same WiFi network
4. Check firewall isn't blocking port 5000

#### Expo Go Not Loading
**Solution**:
1. Restart Expo server: `npx expo start -c`
2. Clear cache: `npx expo start --clear`
3. Reinstall Expo Go app
4. Check QR code is scanning correctly

#### Steps Not Counting
**Solution**:
1. Grant pedometer permissions in phone settings
2. Restart the app
3. Walk a few steps to trigger the sensor
4. Check if device supports pedometer (some emulators don't)

#### Profile Picture Not Uploading
**Solution**:
1. Grant camera/gallery permissions
2. Check image size (large images may take time to encode)
3. Ensure backend is receiving base64 string
4. Check network connection

---

## 📝 Development Notes

### Code Style
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Styling**: NativeWind classes (TailwindCSS)
- **Formatting**: Consistent indentation (2 spaces)

### Best Practices
- ✅ User-specific data storage (workouts, meals)
- ✅ JWT token validation on protected routes
- ✅ Password hashing with bcrypt
- ✅ Input validation on both frontend and backend
- ✅ Error handling with try-catch blocks
- ✅ AsyncStorage for offline data persistence
- ✅ Responsive design for all screen sizes

### Security Considerations
- 🔒 Passwords are hashed (never stored in plain text)
- 🔒 JWT tokens expire after 30 days
- 🔒 Protected routes require valid authentication
- 🔒 CORS enabled for specific origins
- 🔒 Environment variables for sensitive data

---

## 🚀 Future Enhancements

Potential features to add:
- [ ] Social features (friends, challenges)
- [ ] Exercise library with instructions
- [ ] Progress charts and analytics
- [ ] Integration with fitness wearables
- [ ] Meal suggestions and recipes
- [ ] Water intake tracking
- [ ] Sleep tracking
- [ ] Custom workout programs
- [ ] Achievement badges
- [ ] Export data to PDF

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Developer

**Your Name**  
Fitness Tracking Application  
Built with React Native & Node.js

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review error logs in terminal
3. Verify all dependencies are installed
4. Ensure backend and frontend are both running

---

**Last Updated**: November 2025  
**Version**: 1.0.0
