# 🧭 OdysseusAI — AI-Powered Travel Planning Platform

Plan smarter. Travel better. Let AI build your next adventure.

OdysseusAI is a full-stack, AI-driven travel planning platform that takes the friction out of travel coordination. Built using the MERN stack (MongoDB, Express, React, Node.js), it empowers users to generate highly customized, day-by-day itineraries based on their destination, budget, travel style, companions, and schedule. The platform integrates intelligent geocoding, routing, and real-time forecasts to deliver an interactive map and budgeting dashboard.

Unlike static trip directories, OdysseusAI dynamically generates itineraries utilizing OpenAI APIs. It cross-references locations with OpenStreetMap (OSRM, Nominatim) to chart routes, calculate distances, and locate local landmarks. By combining these mapping layers with OpenWeather forecasts and a secure database layer, OdysseusAI acts as a centralized command center for your travel journeys.

Designed with a sleek user experience, OdysseusAI features a responsive dashboard, complete local-storage persisted Dark/Light theme modes driven by custom animated toggles, and secure JWT session controls. The project represents a production-ready web application showcasing modern API integrations, robust state management, and custom animated UI designs.

---

## 🚀 Key Features

### 🤖 AI-Powered Itinerary Planning
* **Structured Generation:** Integrates with the OpenAI API to construct complete day-by-day JSON itineraries.
* **Custom Preferences:** Customizes trip flows depending on travel pace (relaxed vs. fast), companions (solo, friends, family), budget (budget, moderate, luxury), and interest tags.

### 🗺️ Interactive Maps & Routing
* **Geocoding & Route Charting:** Leverages Leaflet maps coupled with Nominatim to map destinations and compute driving distances using the OSRM (Open Source Routing Machine) API.
* **Local Discovery:** Utilizes the Overpass API to query nearby points of interest (attractions, dining, parks) along your generated path.

### 🌤️ Weather Forecast Integration
* **Real-time Forecasts:** Fetches weather forecasts using the OpenWeather API, helping users pack efficiently and schedule outdoor/indoor plans.

### 💰 Budget Planning & Management
* **Expense Tracking:** Allows users to input travel budgets, calculates average costs, and tracks trip expenses in a detailed expense dashboard.

### ✈️ Trip CRUD & Persistence
* **MongoDB Backend:** Full database integration mapping trip states to MongoDB using Mongoose.
* **Cache Management:** Powered by TanStack React Query on the frontend to automatically invalidate and refetch cache collections on trip updates (Create, Read, Update, Delete).

### 📍 Intelligent Destination Card Images
* **MediaWiki API Pipeline:** Replaces grey card placeholders with real, representative destination images. Features a deterministic search routing script that queries Wikipedia's PageImages API, falling back to a CSS-rendered gradient if no image is found.

### 👤 Secure JWT Authentication
* **Authorization Boundaries:** Employs bcryptjs password hashing and JWT access/refresh token pairs. Ensures a user cannot view, edit, or delete another traveler's itineraries.

### 🌙 Dark / Light Mode Toggle
* **Uiverse SVG Switches:** Powered by custom, responsive Sun/Moon animated switches. Persistent configurations are stored in `localStorage` and applied immediately on boot.

---

## 🛠️ Technical Stack

### Frontend
* **Core:** React 19 + Vite
* **Styling:** Vanilla CSS + Tailwind CSS v4 + styled-components (modular wrappers)
* **State & Data Fetching:** TanStack React Query v5 + React Hook Form
* **Navigation:** React Router Dom v7
* **Interactive Elements:** Leaflet (Maps), Recharts (Analytics), Framer Motion (Animations), Lucide React (Icons)

### Backend
* **Runtime:** Node.js + Express.js
* **Database:** MongoDB + Mongoose ORM
* **Security:** Helmet, CORS, Express Rate Limit, Express Validator (Data Sanitization)
* **Real-time Communication:** Socket.IO Client/Server layers
* **Logging:** Winston Logger

---

## ⚙️ How OdysseusAI Works

1. **User Authentication:** The traveler registers or signs in to open a session. Security guards verify JWT tokens on every backend page transition.
2. **Preference Collection:** Users specify destination coordinates, budget tags, travel style preferences, and dates on the trip planner interface.
3. **AI Generation:** The Node server calls the OpenAI API to build a day-by-day itinerary structured dynamically as JSON.
4. **Mapping & Routing:** OpenStreetMap APIs compute geographic coordinates. OSRM builds connecting driving route geometry, and Leaflet renders the path.
5. **Weather & Landscaping:** OpenWeather feeds localized forecasts. Wikipedia's MediaWiki API populates the traveler's Dashboard cards with real city photos.
6. **Trip Lifecycle:** The traveler edits budget limits, adds places, or deletes itineraries, triggering immediate updates to MongoDB and React Query cache refreshes.

---

## 📸 Screenshots

<!-- Add project screenshots here -->
<img width="1890" height="1038" alt="Screenshot 2026-08-20 165605" src="https://github.com/user-attachments/assets/0bcdc98a-fcea-4b08-8ce3-0073ef9545ed" />
<img width="1892" height="1034" alt="Screenshot 2026-08-20 165617" src="https://github.com/user-attachments/assets/c21a3b06-00e9-4ba0-a8c5-31ecce1ff4c9" />
<img width="1894" height="1033" alt="Screenshot 2026-08-20 165723" src="https://github.com/user-attachments/assets/e974dce7-11a9-4702-a8c6-72883c234cc6" />
<img width="1891" height="1036" alt="Screenshot 2026-08-20 165747" src="https://github.com/user-attachments/assets/b9398aef-8db1-4994-8b4d-ed1fdb2f7687" />
<img width="1046" height="1007" alt="Screenshot 2026-08-20 180523" src="https://github.com/user-attachments/assets/0c3f4630-473e-457b-8707-eb9a944cbce1" />
<img width="889" height="804" alt="Screenshot 2026-08-20 180642" src="https://github.com/user-attachments/assets/d9069a2d-605f-4345-b4e0-bc7c01f19f61" />
<img width="921" height="634" alt="Screenshot 2026-08-20 180711" src="https://github.com/user-attachments/assets/cf1fec13-7ba5-4fda-9ed2-cb3195a6b430" />







| Home / Landing Page | User Dashboard |
|---|---|
| ![Home Page](<!-- Add path to homepage screenshot -->) | ![Dashboard Page](<!-- Add path to dashboard screenshot -->) |

| AI Itinerary Detail | Interactive Map & Route |
|---|---|
| ![Itinerary Planning](<!-- Add path to itinerary detail screenshot -->) | ![Map Routing](<!-- Add path to map routing screenshot -->) |

---

## 📂 Project Structure

```
voyageai/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI & Layout Components
│       ├── contexts/     # Auth and Theme state providers
│       ├── hooks/        # Custom React hooks (Health check, APIs)
│       ├── pages/        # Page-level views (Dashboard, Plan Trip, Profiles)
│       ├── services/     # API service layer (Axios clients)
│       └── utils/        # Utility helpers
├── server/          # Express backend
│   ├── config/      # DB configurations and environmental setups
│   ├── controllers/ # HTTP Route handlers
│   ├── middleware/  # JWT auth filters & rate-limit guards
│   ├── models/      # MongoDB Mongoose schemas (User, Trip models)
│   ├── routes/      # Server endpoint routing
│   ├── services/    # Business services (OpenAI, OpenWeather connectors)
│   └── utils/       # Server loggers and controllers
└── package.json     # Workspace management configurations
```

---

## ⚙️ Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **MongoDB:** Installed locally or MongoDB Atlas URI

### Installation
1. Clone the repository to your local system.
2. Install dependencies across the root, client, and server workspaces:
   ```bash
   npm run install-all
   ```

### Configure Environment Variables
Create a `.env` file in the `server` directory by copying `server/.env.example`:
```bash
cp server/.env.example server/.env
```
Fill in the following credentials:
```env
# Server Setup
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Encryption Secrets
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Third-Party API Integrations
OPENAI_API_KEY=your_openai_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

### Running the Application (Development)
Launch the development server. This concurrently starts the backend server (port `5000`) and the Vite client (port `5173`):
```bash
npm run dev
```

### Building for Production
Verify that the project builds cleanly for deployment:
```bash
cd client
npm run build
```

---

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
