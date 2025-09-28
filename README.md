# Medical Sensor Data Collection System

A comprehensive medical sensor data collection system built with React frontend and Node.js backend, designed for collecting patient information and sensor readings from Arduino MQ-3 alcohol sensors.

## Features

### Frontend (React)
- **Comprehensive Login Form** with patient information collection:
  - Full Name
  - Date of Birth (with age validation)
  - Insurance Provider (dropdown selection)
  - Current Symptoms (detailed text area)
- **Real-time Sensor Dashboard** with live data monitoring
- **Responsive Design** optimized for desktop and mobile
- **Modern UI/UX** with gradient backgrounds and smooth animations

### Backend (Node.js + Express)
- **Arduino Serial Communication** for MQ-3 sensor data
- **Supabase Database Integration** for data persistence
- **CORS Support** for frontend communication
- **RESTful API** endpoints for sensor data management
- **User Data Validation** and error handling

## Project Structure

```
Hack_GT_25/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── LoginForm.js  # Patient login form
│   │   │   └── SensorDashboard.js # Sensor monitoring dashboard
│   │   ├── App.js           # Main React app
│   │   └── index.js         # React entry point
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── server.js        # Main server file
│   │   └── app.js           # Client-side JavaScript (legacy)
│   └── package.json         # Backend dependencies
├── database_schema.sql      # Database schema updates
└── package.json            # Root package.json with scripts
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Arduino with MQ-3 sensor connected to COM3 (Windows) or appropriate port
- Supabase account and database

### 1. Install Dependencies

```bash
# Install all dependencies (root, frontend, and backend)
npm run install-all

# Or install manually:
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

Run the SQL commands in `database_schema.sql` in your Supabase SQL editor to add the required columns:

```sql
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS insurance TEXT,
ADD COLUMN IF NOT EXISTS symptoms TEXT;
```

### 4. Arduino Setup

Ensure your Arduino is connected and sending data in one of these formats:
- JSON: `{"analog": 123, "digital": 1}`
- CSV: `123, 1`

Update the `SERIAL_PATH` in `backend/src/server.js` if your Arduino is on a different port.

### 5. Running the Application

#### Development Mode (Recommended)
```bash
# Start both frontend and backend with hot reload
npm run dev
```

#### Production Mode
```bash
# Start both frontend and backend
npm start
```

#### Individual Services
```bash
# Backend only (port 3000)
npm run start:backend

# Frontend only (port 3001)
npm run start:frontend
```

## API Endpoints

### Sensor Data
- `GET /api/sensor` - Get latest sensor reading from memory
- `GET /api/sensor/db-latest` - Get latest reading from database
- `GET /api/readings/all` - Get all readings with pagination

### Data Capture
- `POST /api/capture-and-save` - Capture new reading and save with user data
- `POST /api/save-latest` - Save currently cached reading with user data

### Debug
- `GET /api/debug` - Get current cached reading
- `POST /api/test-insert` - Manual test insert

## Usage

1. **Patient Login**: Patients fill out the comprehensive form with:
   - Personal information (name, birthdate)
   - Insurance details
   - Current symptoms description

2. **Sensor Monitoring**: Once logged in, patients can:
   - View real-time sensor data
   - Capture new readings
   - Save current readings to database

3. **Data Collection**: All sensor readings are saved with associated patient information for medical analysis.

## Technology Stack

- **Frontend**: React 18, CSS3, Modern JavaScript
- **Backend**: Node.js, Express.js, SerialPort
- **Database**: Supabase (PostgreSQL)
- **Hardware**: Arduino with MQ-3 alcohol sensor
- **Development**: Concurrently for parallel development

## Security Features

- CORS protection
- Input validation and sanitization
- Secure data transmission
- Patient data privacy compliance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License - see LICENSE file for details