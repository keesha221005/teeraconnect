# TeeraConnect — Fisher Community & Coastal Weather Platform

**TeeraConnect** is a mobile-first, high-contrast full-stack web application designed for coastal fisher communities across India. It serves as a safety-first dashboard, helping fishers answer the critical daily question: *"Is it safe to go out today, and where should I fish?"*

The application supports multiple major coastal hubs on the West and East coasts of India, offers high-contrast text and icons optimized for direct sunlight readability on mobile phones, provides multi-lingual translation support (English, Kannada, and Tamil), and features a zero-configuration mock fallback mode if the database server is offline.

---

## Technical Stack
- **Frontend:** React + Vite + Tailwind CSS + Leaflet (Maps)
- **Backend:** Node.js + Express
- **Database:** MySQL + Prisma ORM
- **Icons:** Lucide Icons

---

## Project Structure
```
fisher_community/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # MySQL Database Schema
│   │   └── seed.js         # India-wide mock seed data
│   ├── src/
│   │   ├── routes/api.js   # REST endpoint routes (Weather, SOS, Bulletin)
│   │   ├── utils/weather.js# API Fetch / Dynamic Weather Mock
│   │   └── server.js       # Express server initialization
│   └── .env.template       # Environment template
└── frontend/
    ├── src/
    │   ├── context/LanguageContext.jsx # Kannada/Tamil/English translation context
    │   ├── components/                 # View-level widgets
    │   │   ├── SafetyBanner.jsx        # Red/Yellow/Green safety status
    │   │   ├── WeatherSummary.jsx      # Wind, Wave, Tide stats
    │   │   ├── ForecastStrip.jsx       # 7-day weather strip
    │   │   ├── MapView.jsx             # Leaflet pan-and-center map
    │   │   ├── CommunityBulletin.jsx   # Catches & fish price boards
    │   │   └── AdminPanel.jsx          # Password-gated warning console
    │   ├── App.jsx
    │   └── main.jsx
    └── tailwind.config.js  # Light-theme accessibility color extensions
```

---

## Getting Started

### Step 1: Start your Local MySQL Database
TeeraConnect is built on MySQL. Before running the backend, make sure your local MySQL service is active.

**On Windows:**
1. Open Command Prompt as **Administrator**.
2. Run:
   ```cmd
   net start MySQL
   ```
   *(Alternatively, open `services.msc`, locate the `MySQL` service, and click "Start".)*

### Step 2: Configure Environment Variables
1. Navigate to `/backend`.
2. Rename `.env` or check its contents.
3. Update the `DATABASE_URL` with your local MySQL password and database name:
   ```env
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/teeraconnect"
   PORT=5000
   OPENWEATHER_API_KEY="" # (Optional) Insert key to query live weather metrics
   ```

### Step 3: Run Database Migrations and Seed Data
Execute these commands in the `/backend` folder to configure the tables and populate the database with Indian harbor alerts, fishing zones, prices, and test logs:

```bash
cd backend
npx prisma db push
npm run db:seed
```

### Step 4: Run the Backend API Server
Start the Express server on `http://localhost:5000`:
```bash
npm run dev
```

### Step 5: Start the Frontend React Client
In a new terminal window, navigate to the `/frontend` directory and boot up the development server on `http://localhost:5173`:
```bash
cd frontend
npm run dev
```

---

## Features Walkthrough & Test Credentials

- **All-India Coverage Selector:** Switch between different harbors (Mangalore, Kochi, Chennai, Mumbai, etc.) at the top. The weather dashboard will update, and the Leaflet map will dynamically pan to show that port's markers.
- **Safety Indicator Banner:** High-visibility banner (Green/Yellow/Red) derived from wind knots and wave swells. Locations like Chennai and Visakhapatnam default to Red alert status out-of-the-box in seed data.
- **Language Toggle:** Toggle the translation selector in the top-right to change the interface between **English**, **Kannada (ಕನ್ನಡ)**, and **Tamil (தமிழ்)** instantly.
- **Interactive Map:** Leaflet map displays safe (Green), caution (Orange), and storm-risk (Red) fishing coordinates. Tap a pin to see local conditions.
- **Community Bulletin:** View crowdsourced catch logs and the local market board. 
  - *To post catch reports or updates,* you must register by tapping the Profile button in the top-right and inputting any name and a 10-digit phone number.
  - *OTP verification* will print a code to the backend terminal console for security. You can also bypass it in offline dev mode with `1234`.
- **SOS Panel:** Tapping the bottom right **SOS** button retrieves your phone's browser GPS coordinates and generates WhatsApp/SMS pre-filled templates with a Google Maps sharing link. It also displays direct tap-to-call emergency numbers.
- **Admin Console:** Scroll to the bottom footer and click the **TeeraConnect Fisheries Admin Link**.
  - Login password: **`admin123`**
  - Once logged in, administrators can broadcast storm warnings (updating map icons in real-time) and moderate catch logs.
