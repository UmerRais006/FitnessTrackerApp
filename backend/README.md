# My Fitness App - Backend API

RESTful API for the My Fitness App with MongoDB, JWT authentication, and comprehensive validation.

## Features

- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Email verification (optional)
- ✅ Profile management
- ✅ Protected routes with middleware
- ✅ Comprehensive input validation
- ✅ MongoDB with Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/fitness-app
JWT_SECRET=your_secret_key_here
PORT=5000
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

#### Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "profile": {
    "age": 25,
    "gender": "male",
    "height": 180,
    "weight": 75,
    "fitnessGoal": "gain_muscle"
  }
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_here"
}
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <your_jwt_token>
```

## Validation Rules

### Registration
- **Full Name**: Minimum 3 characters
- **Email**: Valid email format
- **Password**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Login
- **Email**: Valid email format
- **Password**: Required

## Database Schema

### User Model
```javascript
{
  fullName: String (required, 3-50 chars),
  email: String (required, unique, valid email),
  password: String (required, hashed, min 8 chars),
  isVerified: Boolean (default: false),
  verificationToken: String,
  profile: {
    age: Number,
    gender: String (male/female/other),
    height: Number (cm),
    weight: Number (kg),
    fitnessGoal: String,
    activityLevel: String
  },
  createdAt: Date,
  lastLogin: Date
}
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected routes with middleware
- Input validation and sanitization
- CORS enabled
- Environment variables for sensitive data

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Validation errors if applicable
}
```

## Success Responses

All successful requests return:
```json
{
  "success": true,
  "message": "Success message",
  "data": {} // Response data
}
```

## MongoDB Setup

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
```bash
mongod
```

### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Testing

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Your React Native app

Example curl:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   └── auth.js           # JWT verification
├── models/
│   └── User.js           # User schema
├── routes/
│   └── auth.js           # Auth routes
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Main server file
```

## License

ISC
