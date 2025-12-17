# Maui Snorkel Report - Development Log

This document tracks all development decisions, changes, and serves as reference for the project.

**Last Updated**: 2025-12-17

---

## Project Overview

Single-page React app displaying daily snorkeling conditions for Maui. Map-centric, mobile-responsive, with booking inquiry and user report submission.

**Domain**: mauisnorkelreport.com
**GitHub**: https://github.com/pathfindr-app/snorkelreportmaui.git

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 + Vite | Frontend framework & build tool |
| Tailwind CSS | Styling (dark ocean aesthetic) |
| Mapbox GL JS | Interactive 3D map |
| OpenWeatherMap API | Live weather data |
| Formspree | Form submissions to email |
| Vercel | Hosting (to be set up) |

---

## API Keys & Endpoints

### Mapbox
- **Token**: `pk.eyJ1IjoicGF0aGZpbmRyIiwiYSI6ImNtamFneW5xZjA1NnUzZm9oMnlyajg0c2MifQ._H8PIWTPYbNVK0vHIoRuWw`
- **Style**: Satellite-streets with 3D terrain

### OpenWeatherMap
- **API Key**: `d2911ca189faa26226488b2c36cb10ca`
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Coords**: lat=20.7984, lon=-156.3319 (Maui center)

### Formspree
- **SpotConditionUpdate** (reports): `https://formspree.io/f/xpqaazzr`
- **ActivityInquiry** (bookings): `https://formspree.io/f/xkowwnnz`

---

## Color Palette

```
Ocean Colors (Dark Theme):
- ocean-50:  #e6f4f9  (lightest - text highlights)
- ocean-100: #c0e4f0
- ocean-200: #8dcde5
- ocean-300: #4fb4d9
- ocean-400: #2196c4
- ocean-500: #0a7ea4
- ocean-600: #086589
- ocean-700: #064c6e
- ocean-800: #0a3854  (primary background)
- ocean-900: #0c2a40  (darker elements)
- ocean-950: #071a2b  (deepest dark - body bg)

Score Colors:
- Red:    #ef4444  (1.0 - 3.5 = Hazardous)
- Orange: #f97316  (3.6 - 5.0 = Caution)
- Yellow: #eab308  (5.1 - 6.5 = Moderate)
- Green:  #22c55e  (6.6 - 10.0 = Good)
```

---

## Score System

| Score Range | Color | Label | Meaning |
|-------------|-------|-------|---------|
| 1.0 - 3.5 | Red | Hazardous | Do not snorkel |
| 3.6 - 5.0 | Orange | Caution | Experienced only |
| 5.1 - 6.5 | Yellow | Moderate | Use caution |
| 6.6 - 10.0 | Green | Good | Safe for most |

---

## Zones (Current)

### 1. Northwest
- **Spots**: Honolua Bay, Kapalua Bay, Napili Bay, Kahana
- **Characteristics**: Exposed to north swell, dramatic when big

### 2. Ka'anapali
- **Spots**: Black Rock (Pu'u Keka'a), Kahekili (Airport Beach)
- **Characteristics**: West-facing, protected from trade winds

### 3. South Shore
- **Spots**: Olowalu, Kamaole 1/2/3 (Kihei), Makena Landing
- **Characteristics**: South-facing, calm in summer, exposed in winter south swell

**Note**: Zone boundaries will be refined. Olowalu may become its own zone.

---

## File Structure

```
src/
├── data/
│   ├── conditions.json        # Daily conditions (SSOT)
│   └── zoneBoundaries.json    # GeoJSON for zone polygons
├── components/
│   ├── Layout/
│   │   └── Header.jsx
│   ├── Landing/
│   │   └── LandingView.jsx    # Initial view with map + zone scores
│   ├── Map/
│   │   ├── MapView.jsx        # Full interactive 3D map
│   │   ├── ZoneLayer.jsx      # Zone boundary polygons
│   │   ├── SpotMarkers.jsx    # Individual spot pins
│   │   └── WeatherOverlay.jsx # Live weather display
│   ├── Modals/
│   │   ├── SpotModal.jsx      # Spot details + maps links
│   │   ├── ReportModal.jsx    # User report form
│   │   └── BookingModal.jsx   # Booking inquiry form
│   └── Mobile/
│       └── ZoneCards.jsx      # Mobile stacked cards view
├── hooks/
│   ├── useConditions.js       # Load conditions data
│   └── useWeather.js          # Fetch weather API
├── utils/
│   ├── scoreToColor.js        # Score -> hex color
│   ├── formatDate.js          # Date formatting
│   └── mapsLinks.js           # Google/Apple Maps URLs
├── App.jsx
├── index.css
└── main.jsx
```

---

## Application State

```javascript
// App.jsx state
{
  currentView: 'landing' | 'map',     // Full page transition
  selectedSpot: null | spotObject,    // Opens SpotModal
  activeModal: null | 'report' | 'booking',
  conditions: {},                      // From conditions.json
  weather: {}                          // From OpenWeatherMap
}
```

---

## Key Decisions Log

### 2025-12-17
1. **Map for everything**: Using Mapbox for both landing and map views (real coordinates for Google/Apple Maps navigation)
2. **Full page transition**: "Explore the Map" does full transition, not overlay
3. **3 zones to start**: Northwest, Ka'anapali, South Shore - will iterate
4. **GeoJSON polygons**: Zone boundaries highlighted on map
5. **No database**: All data in conditions.json, updated via GitHub commits

---

## Development Progress

### Phase 1 - MVP
- [x] Project setup: Vite + React + Tailwind
- [x] Tailwind config with ocean colors
- [x] Folder structure created
- [x] conditions.json with zone/spot data
- [x] zoneBoundaries.json GeoJSON
- [x] Landing view with Mapbox
- [x] Interactive 3D map view
- [x] Spot detail modals with maps links
- [x] Report submission form
- [x] Booking inquiry form
- [x] Weather overlay
- [x] Mobile responsive (ZoneCards)
- [ ] Test and fix any issues
- [ ] Deploy to Vercel

---

## Environment Variables

Create `.env.local` for development:

```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoicGF0aGZpbmRyIiwiYSI6ImNtamFneW5xZjA1NnUzZm9oMnlyajg0c2MifQ._H8PIWTPYbNVK0vHIoRuWw
VITE_OPENWEATHER_API_KEY=d2911ca189faa26226488b2c36cb10ca
VITE_FORMSPREE_REPORT_ID=xpqaazzr
VITE_FORMSPREE_BOOKING_ID=xkowwnnz
```

---

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Mapbox Configuration

### Initial Camera Position
- **Center**: [-156.3319, 20.7984] (Maui center)
- **Zoom**: 9.5 (full island visible)
- **Pitch**: 45 (3D perspective)
- **Bearing**: 0 (North up)

### Terrain Settings
- **Source**: `mapbox://mapbox.mapbox-terrain-dem-v1`
- **Exaggeration**: 1.5

### Map Orientation
- North at TOP
- South at BOTTOM
- West Maui mountains on LEFT
- Haleakala on RIGHT

---

## Spot Coordinates

All coordinates in [longitude, latitude] format (Mapbox standard).

### Northwest Zone
| Spot | Coordinates |
|------|-------------|
| Honolua Bay | [-156.6384, 21.0136] |
| Kapalua Bay | [-156.6693, 21.0028] |
| Napili Bay | [-156.6659, 20.9972] |
| Kahana | [-156.6547, 20.9839] |

### Ka'anapali Zone
| Spot | Coordinates |
|------|-------------|
| Black Rock | [-156.6950, 20.9250] |
| Kahekili | [-156.6936, 20.9372] |

### South Shore Zone
| Spot | Coordinates |
|------|-------------|
| Olowalu | [-156.6103, 20.8106] |
| Kamaole 1,2,3 | [-156.4505, 20.7217] |
| Makena Landing | [-156.4442, 20.6636] |

---

## Notes & Reminders

1. **Spot scores inherit zone score** unless explicitly overridden
2. **Override only if** intel differs by >1.5 points from zone average
3. **Update frequency**: conditions.json updated daily via GitHub push
4. **Mobile first**: Many users are tourists on phones
5. **Maps links**: Every spot modal must have Google Maps + Apple Maps buttons
