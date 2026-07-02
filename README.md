# SafeMother Healthcare & Inventory Management System

SafeMother is a full-stack healthcare and inventory management platform designed for administrators, doctors, midwives, and mothers. It combines appointment management, secure messaging, pregnancy tracking, tip delivery, analytics, and inventory control into a single responsive application.

## Features

- Multi-role authentication and authorization
- Appointment booking and management
- Real-time chat and messaging workflows
- Pregnancy and patient tracking modules
- Health tips and AI-powered recommendations
- Inventory analytics and reorder support
- SQL Server backend with structured data access
- Modern React/Vite frontend interface

## Technologies Used

- React 19
- Vite
- Tailwind CSS
- Express.js
- Node.js
- MSSQL / Microsoft SQL Server
- Axios
- JSON Web Tokens (JWT)
- Resend email integration
- Gemini AI integration
- ESLint

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Healthcare-and-Inventary-Management-System--main
   ```

2. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:

   ```bash
   cd ../client
   npm install
   ```

4. Create environment configuration:

   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your local database, API keys, and service endpoints.

## Project Structure

- `client/` - Frontend application built with React and Vite
  - `src/` - React components, pages, routes, APIs, and styles
  - `package.json` - Frontend dependencies and scripts
- `server/` - Backend API built with Express and Node.js
  - `src/` - Controllers, routes, services, middlewares, repositories, validators
  - `config/` - Database and environment setup
  - `scripts/`, `scratch/` - utility scripts and helpers
  - `package.json` - Backend dependencies and scripts
- `database_scripts/` - SQL schema and database setup scripts
- `sample_users.md` - Example user data for demonstration

## Run the Application

### Start the server

```bash
cd server
npm run dev
```

### Start the client

```bash
cd client
npm run dev
```

## Screenshots

> Add screenshots after running the application and capturing the interface.

- `screenshots/login.png`
- `screenshots/dashboard.png`
- `screenshots/appointments.png`

## Future Improvements

- Add automated tests for backend and frontend
- Implement CI/CD for deployment and quality checks
- Add internationalization support
- Improve accessibility and mobile-first UX
- Add a production-ready deployment guide

## Author

SafeMother Team
