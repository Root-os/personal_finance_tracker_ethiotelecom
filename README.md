# Personal Finance Tracker

A full-stack financial management solution designed for tracking income and expenses with a professional, mobile-first dashboard. Localized for the Ethiopian market with **ETB** currency support and contextual UX.

---
**Author:** Rodas Asmare  
**GitHub:** [Root-os](https://github.com/Root-os)  
**Live Project:** [GitHub Repository](https://github.com/Root-os/personal_finance_tracker_ethiotelecom)
---

## 📂 Project Structure

This repository is organized as a monorepo consisting of:

- **[Finance_tracker_backend](./Finance_tracker_backend)**: Node.js/Express API with MySQL, JWT authentication, and structured logging.
- **[Finance_tracker_frontend](./Finance_tracker_frontend)**: React/Vite/Tailwind v4 dashboard with global state management and premium visualizations.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL
- Docker & Docker Compose (Optional for containerized setup)

### Running with Docker (Recommended)
The easiest way to get the entire stack (Database, Backend, Frontend) running is using Docker:

```bash
docker-compose up --build
```

### Manual Setup

#### 1. Backend
```bash
cd Finance_tracker_backend
npm install
cp .env.example .env # Update with your DB credentials
npm run dev
```

#### 2. Frontend
```bash
cd Finance_tracker_frontend
npm install
cp .env.example .env # Set VITE_API_BASE_URL to http://localhost:5000
npm run dev
```

## 🏗️ Architecture Overview

- **Service-Oriented Backend**: Separation of concerns between controllers, services, and models.
- **Persistent Storage**: MySQL with Sequelize ORM, utilizing migrations and seeding for reliability.
- **Store-Based Frontend**: Centralized state management using Zustand for Auth, Transactions, and Analytics.
- **Secure Communication**: Axios with interceptors for automatic token refresh and error handling.

## 📄 Documentation

- **[Backend Documentation](./Finance_tracker_backend/README.md)**: Deployment, API Endpoints, Security, and Testing.
- **[Frontend Documentation](./Finance_tracker_frontend/README.md)**: Features, Tech Stack, and UI/UX design.
- **[Postman Collection](./Finance_tracker_backend/postman/Finance_Tracker_API.postman_collection.json)**: Import this into Postman for easy API testing.

## ✨ Recruiter Readiness
This project was built to meet and exceed senior take-home project requirements:
- ✅ Full REST API with JWT Auth (Access + Refresh Rotation)
- ✅ Localized UX for Ethiopian market (ETB currency)
- ✅ Comprehensive Test Suite (Jest)
- ✅ Structured Logging & Monitoring (Winston/Morgan)
- ✅ Advanced Security features (Rate limiting, Helmet, etc.)

## 📄 License
MIT License
