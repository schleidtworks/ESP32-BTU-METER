# Honey Hill HVAC React HMI

Interactive HVAC dashboard for the Honey Hill air-to-water system. Built with React + TypeScript + Vite and designed to run in demo mode or with live data.

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173/`).

## What This UI Does

- Real-time dashboard with system KPIs, trend charts, and alert log.
- System schematic with animated flow, clickable nodes, and sprite-based equipment.
- Area and meter drill-downs with week/month/year charts.
- Export selected meters to CSV (Excel-friendly).
- Weather pill with hover dropdown forecast and condition icons.
- Theme switcher: Retro, Viessmann-style, Dark.
- Wallboard mode (full-screen view, auto-rotating tabs).
- Replay timeline to scrub the last 24h or 7d (demo mode).
- Area heatmap, maintenance panel, and energy cost cockpit.

## Navigation

- Tabs (top): Overview, Areas, Meters, Export
- Sidebar: quick navigation by area or meter
- Click/tap a zone or schematic node to open history popup

## Data + Demo Mode

This build runs in demo mode by default and simulates:

- Temp sensors (supply/return)
- Flow meters (GPM)
- BTU calculations
- COP
- Pump states
- Weather
- Alerts and anomalies

## Key Controls

- Theme toggle (Retro / Viessmann / Dark)
- Wallboard mode button in header
- Collapsible sections for all major panels
- Replay timeline scrubber (24h / 7d)

## Configuration

- Energy rate (USD/kWh): `src/App.tsx` `ENERGY_RATE_PER_KWH`
- Buffer tank capacity: `src/config/system.config.ts`
- System layout and areas: `src/config/system.config.ts`
- Demo generator: `src/services/demo.service.ts`

## Assets

Sprites are stored in `src/assets/sprites/` (SVG).

## Next Steps (Optional)

- Wire MQTT for live sensors
- Integrate Emporia CT data
- Add InfluxDB historical queries
- Map real DHW tank data into the UI
