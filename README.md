# Learning Management System (LMS)

A modern, full-stack Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌟 Features

- **Authentication & Authorization**

  - User roles (Student, Teacher, Admin)
  - JWT-based authentication
  - Protected routes

- **Dashboard**

  - Role-specific dashboards
  - Real-time statistics
  - Course overview
  - Announcements
  - Today's schedule

- **Course Management**

  - Course creation and enrollment
  - Department-wise organization
  - Assignment management
  - Course materials

- **Academic Tools**

  - Gradebook management
  - Performance tracking
  - Attendance monitoring
  - Quiz system

- **Communication**
  - Announcements system
  - Course-specific notifications
  - Priority-based messaging

## 🚀 Tech Stack

### Frontend

- React with TypeScript
- Material-UI (MUI) for UI components
- React Router for navigation
- Context API for state management
- Axios for API requests

### Backend

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Error handling middleware
- Logger implementation

## 📦 Installation

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Configuration:

Create `.env` files in both frontend and backend directories:

Backend `.env`:

```env
PORT=3030
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_LIFETIME=1d
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:3030/api/v1
```

4. Start the application:

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## 🌐 API Documentation

API documentation is available in the `backend/API_DOCUMENTATION.md` file. It includes detailed information about all available endpoints, request/response formats, and authentication requirements.

## 📂 Project Structure

```
├── backend/
│   ├── controller/      # Route controllers
│   ├── db/             # Database configuration
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   └── index.html
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing
- Protected routes
- Role-based access control
- Input validation
- Error handling
- Secure HTTP headers

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to all contributors who helped with the project
- Material-UI for the amazing component library
- MongoDB for the robust database solution
