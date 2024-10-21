# Expense Tracker API
## Overview
This project is an Expense Tracker API designed to help users manage their income and expenses. It supports user authentication, transaction recording, and expense tracking features. Users can register, log in, and securely manage their financial statements.

## Key Features
- **User Authentication:** Register, log in, log out, and manage access with JWT tokens.
- **Transaction Management:** Create, view, update, and delete statements (transactions).
- **Expense Summary:** Get a summarized report of expenses by type (income, expense).
- **Token Management:** Automatic access token and refresh token handling.
- **Protected Routes:** Access control via middleware to secure APIs.

## Tech Stack
- **Node.js with Express:** Backend API framework.
- **MongoDB with Mongoose:** Database to store users and their financial statements.
- **JWT (JSON Web Token):** For secure authentication and refresh token management.
- **bcryptjs:** For password hashing.
- **cookie-parser Auth:** Secure access and refresh token storage using HTTP-only cookies.
  
## Dependencies
To run this application, the following dependencies are required:
```json
"dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
```

## Installation

1. Clone the repository using:
   ```sh
   git clone https://github.com/NightFury300/Expends.git
   ```
2. Change directory to the `expendsBackend` folder which contains the source files:
   ```sh
   cd Expend
   cd expendsBackend
   ```
3. Install all the dependencies:
   ```sh 
   npm install
   ```
4. Set up the `.env` file and modify the `MONGODB_URI` in the `.env` file and `DB_NAME` in `constants.js` to use your own database URI and port.
5. Start the application:
   ```sh 
   npm run dev
   ```
6. As of now, only the backend of the site is up and running, frontend will be done in react.js, and this will be updated shortly, meanwhile you can use postman for testing.
7.Access the backend at:
```
https://localhost:3000/api/v1/users
```
   
## API Endpoints

### User Authentication
- **1. Register a User**
`POST /register`

**Request Body:**
``` json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123"
}
```
**Response:**
``` json
{
  "status": 200,
  "data": {
    "_id": "user_id",
    "username": "testuser",
    "email": "testuser@example.com"
  },
  "message": "User registered successfully."
}
```
- **2. Login a User**
`POST /login`

**Request Body:**
``` json
{
  "username": "testuser",
  "password": "password123"
}
```
**Response:**
```json
{
  "status": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "testuser"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  },
  "message": "User logged in successfully."
}
```
- **3. Logout a User**
`POST /logout`

Clears the cookies storing access and refresh tokens.
**Response:**
```json
{
  "status": 200,
  "message": "User logged out successfully."
}
```
- **4. Refresh Access Token**
`POST /refresh-token`

Validates refresh token and refreshes access token for a valid refresh token.
**Response:**
```json
{
  "status": 200,
  "data": {
      "refreshToken": "your_refreshToken"
      "accessToken": "your_accessToken"
  "message": "Access Token Refreshed Successfully"
}
```
### Statement Management
- **1. Create a Statement**
`POST /create-statement`

**Request Body:**
``` json
{
  "name": "Salary",
  "amount": 5000,
  "type": "income"
}
```
**Response:**
``` json
{
  "status": 200,
  "data": {
    "_id": "statement_id",
    "name": "Salary",
    "amount": 5000,
    "type": "income"
  },
  "message": "Statement created successfully."
}
```
- **2. Get All Statements**
`GET /get-statement/:statementId`

**Response:**
``` json
{
  "status": 200,
  "data": [
    {
      "_id": "statement_id",
      "name": "Salary",
      "amount": 5000,
      "type": "income",
      "date": "10/22/2024",
      "time": "10:00 AM"
    },
    {
      "_id": "statement_id",
      "name": "Food",
      "amount": 1000,
      "type": "expend",
      "date": "10/23/2024",
      "time": "11:30 AM"
    }
  ],
  "message": "Statements fetched successfully."
}
```
- **3. Get a Single Statement**
`GET /get-statement/:statementId`

**Response:**
```json
{
  "status": 200,
  "data": {
    "_id": "statement_id",
    "name": "Salary",
    "amount": 5000,
    "type": "income",
    "date": "10/22/2024",
    "time": "10:00 AM"
  },
  "message": "Statement fetched successfully."
}
```
- **4. Update a Statement**
`PATCH /update-statement`

**Request Body:**
``` json
{
  "statementId": "statement_id"
  "name": "Freelance Work",
  "amount": 3000,
  "type": "income"
}
```
**Response:**
``` json
{
  "status": 200,
  "data": {
    "_id": "statement_id",
    "name": "Freelance Work",
    "amount": 3000,
    "type": "income"
  },
  "message": "Statement updated successfully."
}
```
- **5. Delete a Statement**
`DELETE /get-statement/:statementId`

**Response:**
```json
{
  "status": 200,
  "data": {
    "_id": "statement_id",
    "name": "Freelance Work",
    "amount": 3000,
    "type": "income"
  },
  "message": "Statement deleted successfully."
}
```
### Summary Management
- **1. Get Summary of Statements**
`GET /get-statement-summary`

**Response:**
``` json
{
  "status": 200,
  "data": [
    {
      "_id": "income",
      "totalAmount": 8000
    },
    {
      "_id": "expense",
      "totalAmount": 2000
    }
  ],
  "message": "Data summarized successfully."
}
```
## Acknowledgements
Thank you for checking out the Expends Web Application! For any inquiries or feedback, feel free to reach out to me at [shubhsaxena447@gmail.com](mailto:shubhsaxena447@gmail.com).
