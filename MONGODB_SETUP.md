# 🎯 Complete MongoDB Backend Integration Guide

## 📋 Overview

Your fitness app now has a complete MongoDB backend with:
- ✅ User registration & login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Comprehensive validation on both frontend & backend
- ✅ Secure API with protected routes
- ✅ Beautiful home page after successful login
- ✅ Global auth state management

---

## 🚀 Quick Start

### **Step 1: Install Frontend Dependencies**

```bash
# In your main project directory
npx expo install axios @react-native-async-storage/async-storage
```

### **Step 2: Install MongoDB**

**Option A: Local MongoDB (Recommended for Development)**
1. Download MongoDB Community Edition from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB:
   ```bash
   # Windows (run as Administrator)
   net start MongoDB
   
   # Or start manually
   mongod
   ```

**Option B: MongoDB Atlas (Cloud - Free Tier)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

### **Step 3: Setup Backend**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000
```

### **Step 4: Update API URL (Important!)**

Open `services/api.ts` and update the API_URL based on your setup:

```typescript
// For Android Emulator
const API_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
const API_URL = 'http://localhost:5000/api';

// For Physical Device (replace with your computer's IP)
const API_URL = 'http://192.168.1.XXX:5000/api';
```

To find your computer's IP:
```bash
# Windows
ipconfig

# Look for "IPv4 Address" under your active network adapter
```

### **Step 5: Run Your App**

```bash
# In main project directory
npx expo start --clear
```

---

## 📁 Project Structure

```
My-Fitness-App/
├── backend/                    # Backend API
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── auth.js            # API routes
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Main server
│
├── app/                       # React Native screens
│   ├── index.tsx              # Login screen
│   ├── signup.tsx             # Signup screen
│   ├── home.tsx               # Home screen (after login)
│   └── _layout.tsx            # Root layout
│
├── context/
│   └── AuthContext.tsx        # Global auth state
│
├── services/
│   └── api.ts                 # API service layer
│
└── package.json
```

---

## 🔐 Authentication Flow

### **Registration Flow:**
1. User fills signup form
2. Frontend validates input
3. API call to `POST /api/auth/register`
4. Backend validates & hashes password
5. User saved to MongoDB
6. JWT token generated & returned
7. Token stored in AsyncStorage
8. User redirected to home page

### **Login Flow:**
1. User enters credentials
2. Frontend validates input
3. API call to `POST /api/auth/login`
4. Backend verifies credentials
5. JWT token generated & returned
6. Token stored in AsyncStorage
7. User redirected to home page

### **Protected Routes:**
- JWT token automatically attached to requests
- Backend middleware verifies token
- Invalid/expired tokens redirect to login

---

## 🧪 Testing the API

### **Using Thunder Client / Postman:**

**1. Register User:**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**2. Login:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**3. Get Current User (Protected):**
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 📊 Database Schema

### **User Model:**
```javascript
{
  fullName: String (required, 3-50 chars),
  email: String (required, unique, validated),
  password: String (hashed, min 8 chars),
  isVerified: Boolean (default: false),
  profile: {
    age: Number,
    gender: String,
    height: Number (cm),
    weight: Number (kg),
    fitnessGoal: String,
    activityLevel: String
  },
  createdAt: Date,
  lastLogin: Date
}
```

---

## ✅ Validation Rules

### **Frontend & Backend:**

**Registration:**
- Full Name: Min 3 characters
- Email: Valid email format
- Password: 
  - Min 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

**Login:**
- Email: Valid format
- Password: Required

---

## 🔧 Environment Variables

**backend/.env:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

**⚠️ Important:** Change `JWT_SECRET` to a random secure string in production!

---

## 🐛 Troubleshooting

### **"Cannot connect to MongoDB"**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### **"Network request failed" in app**
- Check API_URL in `services/api.ts`
- Ensure backend server is running
- For physical device, use computer's IP address
- Check firewall settings

### **"Token expired" errors**
- Tokens expire after 7 days by default
- User will be logged out automatically
- Change `JWT_EXPIRE` in `.env` if needed

### **"Cannot find module" errors**
- Run `npm install` in backend directory
- Run `npx expo install axios @react-native-async-storage/async-storage` in main directory

---

## 🎨 Features

### **Current Features:**
✅ User registration with validation  
✅ Secure login with JWT  
✅ Password hashing (bcrypt)  
✅ Protected routes  
✅ Beautiful UI with NativeWind  
✅ Loading states & error handling  
✅ Home page after login  
✅ Logout functionality  

### **Ready to Add:**
- Email verification
- Password reset
- Profile editing
- Workout tracking
- Progress charts
- Social features

---

## 📱 App Screens

### **1. Login Screen** (`app/index.tsx`)
- Email & password inputs
- Validation with error messages
- Loading state
- Link to signup

### **2. Signup Screen** (`app/signup.tsx`)
- Full name, email, password, confirm password
- Real-time password strength indicator
- Comprehensive validation
- Link back to login

### **3. Home Screen** (`app/home.tsx`)
- Welcome message with user's name
- Stats cards (calories, workouts)
- Quick action buttons
- Today's plan section
- Recent activity
- Logout button

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ Input validation & sanitization
- ✅ CORS enabled
- ✅ Environment variables for secrets
- ✅ Automatic token expiration

---

## 📚 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/verify-email` | Verify email | No |

---

## 🚀 Next Steps

1. **Install dependencies** (see Step 1 above)
2. **Start MongoDB** (local or Atlas)
3. **Start backend server** (`npm run dev` in backend/)
4. **Update API URL** in `services/api.ts`
5. **Run your app** (`npx expo start --clear`)
6. **Test registration & login!**

---

## 💡 Tips

- Use MongoDB Compass to view your database visually
- Check backend console for API request logs
- Use React Native Debugger for frontend debugging
- Keep backend server running while testing app

---

## 📞 Support

If you encounter issues:
1. Check backend console for errors
2. Check app console/logs
3. Verify MongoDB is running
4. Ensure correct API URL
5. Check network connectivity

---

**🎉 You're all set! Your fitness app now has a complete authentication system with MongoDB backend!**
