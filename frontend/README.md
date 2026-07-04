# React Admin Starter Kit

A modern, production-ready React admin dashboard starter kit built with Vite, Redux Toolkit, React Router, and Tailwind CSS v4. This project provides a solid foundation for building admin panels, dashboards, or any authenticated web application.

## ✨ Features

- **Modern Stack**: React 19, Vite, Redux Toolkit, React Router v7
- **Beautiful UI**: Tailwind CSS v4 with custom theme system
- **Dark Mode**: Full light/dark mode support with smooth transitions
- **Theme Customization**: Multiple accent colors (Blue, Emerald, Violet)
- **Authentication**: Complete auth flow with protected routes
- **Responsive Design**: Mobile-first responsive layout with sidebar navigation
- **API Integration**: RTK Query for efficient data fetching
- **Mock Service Worker**: API mocking for development
- **Modular Architecture**: Feature-based folder structure
- **Accessible**: Built with accessibility best practices
- **State Management**: Redux Toolkit with persistence

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router v7** - Routing
- **Tailwind CSS v4** - Styling
- **MSW (Mock Service Worker)** - API mocking
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── api/                    # API configuration and endpoints
│   ├── baseApi.js         # RTK Query base API setup
│   └── userApi.js         # User API endpoints
├── app/                    # App-level configuration
│   ├── hooks.js           # Typed Redux hooks
│   └── store.js           # Redux store configuration
├── assets/                 # Static assets
├── components/             # Reusable components
│   ├── common/            # Common components (ThemeSwitcher, ConfirmDialog)
│   ├── layout/            # Layout components (Header, Sidebar, DashboardLayout)
│   └── ui/                # UI primitives (Button, Input, Select)
├── features/               # Feature-based modules
│   ├── auth/              # Authentication feature
│   │   ├── authSlice.js   # Auth Redux slice
│   │   └── authSelectors.js # Auth selectors
│   └── theme/             # Theme feature
│       ├── themeSlice.js  # Theme Redux slice
│       └── themeSelectors.js # Theme selectors
├── mocks/                 # MSW mock handlers
│   ├── browser.js         # MSW browser setup
│   └── handlers.js        # API mock handlers
├── pages/                  # Page components
│   ├── auth/              # Auth pages (Login, Register)
│   ├── dashboard/         # Dashboard pages
│   └── users/             # User management pages
├── routes/                 # Route configuration
│   ├── AppRoutes.jsx      # Main routing setup
│   ├── PrivateRoute.jsx   # Protected route wrapper
│   └── PublicRoute.jsx     # Public route wrapper
├── utils/                  # Utility functions
│   ├── classnames.js      # Class name utilities
│   ├── constants.js        # App constants
│   └── storage.js         # LocalStorage utilities
├── App.jsx                 # Root component
├── main.jsx                # Entry point
└── index.css               # Global styles and Tailwind imports
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone or download this project**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - Default credentials (from MSW mocks):
     - Email: `admin@example.com`
     - Password: `password`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Architecture Overview

### Feature-Based Structure

This project follows a **feature-based architecture** where related code is grouped by feature rather than by file type. Each feature contains:

- **Slice**: Redux state management (`*Slice.js`)
- **Selectors**: Memoized state selectors (`*Selectors.js`)
- **API**: RTK Query endpoints (in `api/` folder)
- **Components**: Feature-specific components (if needed)
- **Pages**: Feature pages (in `pages/` folder)

### State Management

- **Redux Toolkit**: Centralized state management
- **RTK Query**: Handles API calls, caching, and synchronization
- **LocalStorage**: Persists auth and theme preferences

### Routing

- **Public Routes**: Login, Register (accessible when logged out)
- **Private Routes**: Dashboard, Users (require authentication)
- **Layout Routes**: DashboardLayout wraps all private routes

### Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **CSS Variables**: Dynamic theming with CSS custom properties
- **Dark Mode**: Class-based dark mode (`dark:` prefix)
- **Responsive**: Mobile-first breakpoints (sm, md, lg)

## 🎨 Theming System

### Dark Mode

Dark mode is implemented using Tailwind's `dark:` variant. The theme preference is stored in localStorage and applied immediately on page load to prevent flash.

**Toggle dark mode**: Click the theme switcher button in the header (🌙/☀️)

### Accent Colors

Three accent color themes are available:

- **Blue** (default)
- **Emerald** (green)
- **Violet** (purple)

**Change accent**: Use the dropdown next to the theme switcher

### Customization

To add new accent colors, update `src/index.css`:

```css
[data-accent="your-color"] {
  --accent-50: #...;
  --accent-100: #...;
  --accent-500: #...;
  --accent-600: #...;
}
```

## 🔐 Authentication

### Flow

1. User logs in via `/login`
2. Credentials are validated (mocked by MSW)
3. Token and user data stored in Redux + localStorage
4. User redirected to dashboard
5. Protected routes check authentication status

### Protected Routes

Routes wrapped in `<PrivateRoute>` require authentication. Unauthenticated users are redirected to `/login`.

### Mock Authentication

In development, MSW mocks the authentication API. You can modify mock responses in `src/mocks/handlers.js`.

## 📡 API Integration

### RTK Query Setup

API endpoints are defined using RTK Query in the `api/` folder:

```javascript
// Example: src/api/userApi.js
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),
    // ... more endpoints
  }),
});
```

### Mock API

MSW intercepts API calls in development. To modify mock data, edit `src/mocks/handlers.js`.

**To use real API**: Update `baseUrl` in `src/api/baseApi.js` and remove MSW in production.

## 🧩 Adding New Features

### 1. Create Feature Slice

```javascript
// src/features/yourFeature/yourFeatureSlice.js
import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "yourFeature",
  initialState: {
    /* ... */
  },
  reducers: {
    /* ... */
  },
});

export const {
  /* actions */
} = slice.actions;
export default slice.reducer;
```

### 2. Add to Store

```javascript
// src/app/store.js
import yourFeatureReducer from "../features/yourFeature/yourFeatureSlice";

export const store = configureStore({
  reducer: {
    // ... existing reducers
    yourFeature: yourFeatureReducer,
  },
});
```

### 3. Create API Endpoints (if needed)

```javascript
// src/api/yourApi.js
export const yourApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ... endpoints
  }),
});
```

### 4. Create Pages/Components

Add pages in `src/pages/` and components in `src/components/`.

### 5. Add Routes

Update `src/routes/AppRoutes.jsx` to include new routes.

## 🎯 Key Concepts

### Typed Redux Hooks

Use typed hooks from `src/app/hooks.js`:

```javascript
import { useAppDispatch, useAppSelector } from "./app/hooks";

// Typed dispatch and selector
const dispatch = useAppDispatch();
const user = useAppSelector((s) => s.auth.user);
```

### Component Structure

- **Layout Components**: Structure (Header, Sidebar)
- **UI Components**: Reusable primitives (Button, Input)
- **Page Components**: Full page views
- **Feature Components**: Feature-specific components

### Styling Guidelines

- Use Tailwind utility classes
- Prefer composition over custom CSS
- Use `dark:` prefix for dark mode styles
- Use accent color utilities (`bg-accent-500`, `text-accent-600`)

## 🔧 Configuration Files

- **`vite.config.js`**: Vite configuration
- **`tailwind.config.js`**: Tailwind CSS configuration
- **`postcss.config.js`**: PostCSS plugins
- **`eslint.config.js`**: ESLint rules

## 📦 Building for Production

```bash
npm run build
```

The production build will be in the `dist/` folder. The build is optimized and minified for production.

## 🤝 Contributing

This is a starter kit template. Feel free to:

1. Fork/clone this project
2. Customize it for your needs
3. Add your own features
4. Share improvements

## 👨‍💻 Author

Developed and maintained by [@pronazmul](https://github.com/pronazmul)

## 📝 License

This project is open source and available under the **MIT License**.

## 💬 Feedback & Collaboration

If you'd like feedback on your own project structure, need suggestions for best practices, or want help reorganizing your React app following industry standards feel free to reach out via email: **mnazmul.dev@gmail.com**

**Happy Coding! 🚀**
