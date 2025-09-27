# AutoVitals Kiosk

A frontend-only web application for capturing patient vitals data with Arduino integration. No backend, no database - everything runs in the browser with local storage and JSON download capabilities.

## Features

- **Secure & Local**: All data stays on the device, no network transmission
- **Arduino Integration**: Web Serial API support for real hardware
- **Simulation Mode**: Built-in simulation for testing without hardware
- **Modern UI**: Hospital-themed design with accessibility features
- **Paperless**: Digital forms and JSON export
- **Fast Capture**: 10-second stabilized readings

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **React Hook Form** + **Zod** for form validation
- **Zustand** for state management
- **Lucide React** for icons
- **Web Serial API** for Arduino communication

## Getting Started

### Prerequisites

- Node.js 18+ 
- Chrome or Edge browser (for Web Serial API)
- Arduino with vitals sensors (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vitals_intake
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in Chrome or Edge

## Usage

### Basic Workflow

1. **Start Check-In** (`/start`)
   - Review consent and privacy information
   - Click "Start Check-In" to begin

2. **Capture Vitals** (`/capture`)
   - Connect Arduino or use simulation mode
   - Fill in patient details
   - Start 10-second capture process
   - Review captured vitals

3. **Review Information** (`/review`)
   - Verify all patient and vitals data
   - Save and download JSON file

4. **Success** (`/success`)
   - Get your Check-In ID
   - View QR code
   - Start new check-in if needed

### Hardware Setup

#### Arduino Requirements

Your Arduino should output JSON data over serial at 115200 baud rate. Expected format:

```json
{
  "ts": 1732665600000,
  "bp": {"sys": 118, "dia": 76},
  "hr": 82,
  "spo2": 97,
  "tempC": 37.1,
  "weightKg": 71.4
}
```

#### Enabling Web Serial in Chrome

1. Open Chrome and navigate to `chrome://flags/`
2. Search for "Web Serial"
3. Enable "Experimental Web Platform features"
4. Restart Chrome
5. Navigate to the app and click "Connect Arduino"

### Simulation Mode

If you don't have Arduino hardware:

1. Click "Simulate" button on the capture page
2. The app will generate realistic vitals data
3. Click "Start Capture" to process simulated readings
4. All functionality works the same as with real hardware

## Data Format

### Vitals Data

- **Blood Pressure**: Systolic (60-220 mmHg), Diastolic (30-140 mmHg)
- **Heart Rate**: 30-220 bpm
- **SpO₂**: 70-100%
- **Temperature**: 30-45°C
- **Weight**: 1-500 kg (optional)

### JSON Export

The app generates JSON files with this structure:

```json
{
  "shortId": "patient0001",
  "patient": {
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-01-01"
  },
  "insurance": {
    "provider": "Health Insurance Co",
    "memberId": "123456789"
  },
  "additional": {
    "meds": ["Aspirin", "Metformin"],
    "allergies": ["Penicillin"],
    "symptoms": "Chest pain"
  },
  "vitals": {
    "bpSys": 120,
    "bpDia": 80,
    "hr": 75,
    "spo2": 98,
    "tempC": 36.8,
    "weightKg": 70
  },
  "capturedAt": "2024-01-01T12:00:00.000Z"
}
```

## Development

### Project Structure

```
/app/
  (routes)/
    start/page.tsx      # Landing page
    capture/page.tsx    # Vitals capture
    review/page.tsx     # Data review
    success/page.tsx    # Success page
/components/            # Reusable components
/lib/
  serial/              # Web Serial integration
  store.ts             # Zustand state management
  validation.ts        # Zod schemas
  shortId.ts           # ID generation
  download.ts          # JSON download
  utils.ts             # Utility functions
```

### Key Components

- **VitalCard**: Displays individual vital measurements
- **SerialConnect**: Manages Arduino connection and simulation
- **IntakeForm**: Patient information forms
- **Button**: Consistent button styling
- **Card**: Container component

### State Management

The app uses Zustand for state management with these key stores:

- Patient information
- Insurance details
- Vitals data with capture status
- Serial connection state
- Form validation state

## Browser Compatibility

- **Chrome/Edge**: Full support including Web Serial API
- **Firefox/Safari**: Limited support (simulation mode only)
- **Mobile**: Responsive design, simulation mode only

## Security & Privacy

- **No Network Calls**: All data stays local
- **No Backend**: Frontend-only application
- **Local Storage**: Patient counter stored in localStorage
- **JSON Export**: Data can be downloaded and shared manually

## Troubleshooting

### Web Serial Not Working

1. Ensure you're using Chrome or Edge
2. Check that Web Serial is enabled in flags
3. Verify Arduino is connected and outputting data
4. Check browser console for error messages

### Simulation Issues

1. Click "Stop Simulation" then "Simulate" again
2. Refresh the page if data stops updating
3. Check browser console for errors

### Form Validation

1. Ensure all required fields are filled
2. Check that vitals are captured (green checkmarks)
3. Verify date format for date of birth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Create an issue with detailed information
4. Include browser version and error messages