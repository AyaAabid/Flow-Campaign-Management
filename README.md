# Campaign Management Platform

This is a full-stack Campaign Management Platform built with the MERN stack, designed to improve cross-team collaboration within a marketing agency.
The platform focuses on the Editor role, allowing individuals within the agency to create, manage, and track advertising campaigns with automated status updates. It also provides dashboard visualizations to monitor campaign performance.

## Features

- **Campaign Management**: Create, edit, and manage advertising campaigns with automated status tracking
- **Multi-Entity Support**: Manage agencies, brands, and campaigns in one unified platform
- **Smart Status System**: Automatic campaign status updates (Waiting for approval → Ready to go → Running → Completed)
- **Advanced Filtering**: Filter campaigns by status and search across campaigns, brands and agencies
- **Analytics Dashboard**: Visualize campaign performance in the dashboard
- **Role-Based Access**: Editor-focused interface for internal team collaboration

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Ant Design** for UI components
- **Recharts** for data visualization
- **Axios** for API communication

### Backend
- **Node.js** & **Express.js** for server
- **MongoDB** with **Mongoose** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads

## Prerequisites

Before running this project, ensure you have:

- Node.js 
- MongoDB 
- npm package manager

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AyaAabid/Flow-Campaign-Management.git
cd Flow-Campaign-Management
```

### 2. Backend Setup

```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
```

The server will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```
Start the development server:

```bash
npm run dev
```
The application will open at `http://localhost:5173`


## Deployment

A live demo is available at: [Click here](https://flow-frontend-pied.vercel.app/)

**Note:** The deployment version has CORS configuration issues that im trying to fix, but the local environemment is fully stable.
