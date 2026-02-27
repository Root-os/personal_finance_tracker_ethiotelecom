# Personal Finance Tracker (Frontend)

A modern, high-performance financial management dashboard built with **React**, **Vite**, and **Tailwind CSS v4**. Designed with a mobile-first, professional SaaS aesthetic and localized for the Ethiopian market (**ETB**).

---
**Author:** Rodas Asmare  
**GitHub:** [Root-os](https://github.com/Root-os)  
**Project Repository:** [personal_finance_tracker](https://github.com/Root-os/personal_finance_tracker_ethiotelecom)
---

## ✨ Key Features

### 🔐 Advanced Authentication
- **Secure Flow**: Robust login and registration with email verification support.
- **Session Management**: Users can view and revoke active sessions (devices) for maximum security.
- **Password Safety**: Real-time password strength meter and professional MJML-based reset flow.
- **State Integrity**: Persistent auth state with automatic token management via Axios interceptors.

### 📊 Financial Insights
- **Dashboard**: Real-time overview of balance, income, expenses, and savings rate.
- **Analytics**: Comprehensive spending trends, category breakdowns, and top expenses reports.
- **Dynamic Charts**: Visual representation of financial health using premium components.

### 💸 Transaction Management
- **Full CRUD**: Seamlessly create, edit, search, and filter transactions.
- **Quick Add Category**: Direct inline category creation within the transaction form for an uninterrupted workflow.
- **Pagination**: Optimized for large datasets with smooth navigation.

### 🎨 Premium UI/UX
- **Localized for Ethiopia**: Native support for **ETB** currency formatting and Ethiopian-centric placeholders.
- **Theme Support**: Fully adaptive Light and Dark modes.
- **Performance**: Zero-hydration-overhead loading states and smooth CSS animations.
- **Toast Notifications**: Context-aware feedback for all user actions.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with custom interceptors)

## 🏗️ Architecture

- **Store-Based State**: Centralized business logic in Zustand stores (Auth, Transaction, Category, Analytics).
- **Service Layer**: Decoupled API logic in `src/lib/api.js`.
- **Component Design**: Atomic approach with reusable UI elements (Button, Input, Card, Field, etc.).
- **Error Handling**: Standardized error normalization for consistent UI feedback.

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `VITE_API_BASE_URL` (usually `http://localhost:5000`).

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🌍 Localization Details
This application is specifically tailored for **Ethiopian users**:
- **Currency**: Displayed as `ETB` with `en-ET` locale formatting.
- **Placeholders**: Contextually relevant examples (e.g., "Abebe Bikila", "Equb", "Injera").
- **Language**: English (Primary).

## 📄 License
MIT License.
