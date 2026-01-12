# Home Energy Monitoring System for Air-to-Water Heat Pumps

A DIY energy monitoring dashboard for tracking the real-world performance of residential air-to-water heat pump systems. Built with an ESP32, temperature sensors, flow meters, and a React dashboard.

**The Goal**: Answer the question every heat pump owner asks - *"Is this thing actually saving me money?"*

---

## Why This Exists

Air-to-water heat pumps are becoming popular for home heating, but most homeowners have no idea if their system is performing efficiently. Manufacturer specs say "COP of 4.0!" but what are YOU actually getting in YOUR climate with YOUR installation?

This project measures:
- **Actual BTU output** from temperature sensors and flow meters
- **Real electricity consumption** from CT clamps
- **True COP** calculated from measured data, not guesses
- **Cost per MMBTU** compared to natural gas prices

---

## How It Works

### The Sensors (ESP32-based)

```
Water Loop Monitoring:
├── DS18B20 Temperature Sensors (supply & return temps)
├── GREDIA Hall Effect Flow Meters (GPM)
└── Emporia Vue CT Clamps (electricity usage)

BTU Calculation:
BTU/hr = 500 x GPM x (Supply Temp - Return Temp)

COP Calculation:
COP = BTU Output / (kWh x 3412)
```

### The Dashboard (React + TypeScript)

A retro-styled web interface that displays:
- Live system schematic with temps and flow rates
- Real-time COP and BTU readings
- Daily/monthly cost tracking
- Comparison to local natural gas prices (EIA data)
- AI-powered analysis (optional, uses Claude or GPT)

---

## My Setup

| Component | Model |
|-----------|-------|
| Heat Pump | Apollo 5-Ton Air-to-Water (MBTEK EVI Inverter) |
| Buffer Tank | 30 Gallon thermal storage |
| Distribution | 3x Hydronic Air Handlers + Radiant Snow Melt |
| Controller | ESP32 DevKit V1 |
| Temp Sensors | DS18B20 OneWire (10 sensors on single bus) |
| Flow Meters | GREDIA Hall Effect (450 pulses/gallon) |
| Power Monitor | Emporia Vue with 5 CT clamps |

---

## Key Features

### Energy Monitoring
- **Real-time BTU output** per zone (calculated from flow + delta-T)
- **Live COP calculation** updated every few seconds
- **Daily/monthly energy totals** with historical tracking
- **kWh tracking** via Emporia Vue CT clamps
- **Multi-zone support** for independent air handlers

### Cost Analysis
- **Price per MMBTU** - Your actual heating cost calculated from real data
- **EIA comparison** - Side-by-side with natural gas prices for your state
- **Breakeven COP calculator** - Know exactly when heat pump beats gas
- **Daily cost log** - Track spending over time with CSV export
- **Savings tracker** - See monthly/yearly savings vs alternative fuels

### Live System Schematic
- **Animated flow visualization** - See water moving through pipes
- **Temperature labels** - Supply and return temps at every point
- **Flow rate display** - GPM readings at each zone
- **Equipment status** - Running/stopped indicators
- **Heat pump, buffer tank, air handlers** - Full system view

### Smart Alerts & Alarm Log
- **Low COP warnings** - Catch efficiency problems early
- **Flow rate issues** - Detect pump failures or air locks
- **Temperature anomalies** - High delta-T, frozen pipes
- **Sensor offline** - Know when sensors go stale
- **Start/end times** - Track how long issues lasted
- **Duration tracking** - See alert history with ACTIVE badge

### AI Operations Analyst ("Simon Says")
- **Health score** - 0-100 grade with A-F rating
- **Period analysis** - Daily, weekly, monthly, yearly views
- **Efficiency insights** - AI-generated recommendations
- **Auto-logging** - Saves daily summaries automatically
- **Claude or GPT** - Works with either API (or demo mode)

### Email Reports
- **Daily reports** - Morning summary of yesterday's performance
- **Monthly reports** - Full month analysis with trends
- **Multiple recipients** - Add your email list
- **HTML formatted** - Professional reports with charts
- **Cost analysis included** - Savings vs gas calculated

### Data Export & History
- **CSV export** - Download price tracking data
- **JSON export** - Full AI summary history
- **Historical view** - Browse past daily summaries
- **Performance trends** - See if efficiency is improving or declining

### Dashboard UI
- **4 themes** - Retro (8-bit), Viessmann (clean), Dark, Apple (iOS)
- **Responsive layout** - Works on desktop and tablet
- **ESP32 pin map** - Visual GPIO reference
- **Weather integration** - Local conditions display
- **Clock with date** - System time reference

---

## Quick Start

```bash
# Clone and run the dashboard
cd dashboard/react-hmi
npm install
npm run dev
```

Opens at http://localhost:5173 in **demo mode** (simulated data).

For real monitoring, connect your ESP32 via MQTT.

---

## BTU Meter Calculation

The core formula for hydronic systems:

```
BTU/hr = 500 x GPM x Delta-T

Where:
- 500 = water constant (8.33 lb/gal x 60 min/hr)
- GPM = flow rate from meter
- Delta-T = supply temp minus return temp (°F)
```

Example: 5 GPM with 10°F delta = 25,000 BTU/hr

---

## Is Your Heat Pump Worth It?

The dashboard calculates your **breakeven COP** - the efficiency needed to beat natural gas:

```
Breakeven COP = (Electricity Rate x 1,000,000) / (Gas Rate x 3,412)

Example (CT prices):
- Electricity: $0.25/kWh
- Natural Gas: $18.50/MMBTU
- Breakeven COP = ($0.25 x 1,000,000) / ($18.50 x 3,412) = 3.96

If your COP > 3.96, heat pump is cheaper than gas
If your COP < 3.96, you'd save money with gas
```

---

## Project Structure

```
ESP32-BTU-METER/
├── dashboard/
│   └── react-hmi/          # React dashboard
│       ├── src/
│       │   ├── components/ # UI components
│       │   ├── services/   # AI, pricing, reports
│       │   └── types/      # TypeScript definitions
│       └── package.json
├── firmware/               # ESP32 code (coming)
└── README.md
```

---

## Configuration

**Electricity Rate**: Default $0.25/kWh (CT average)

**Natural Gas Rate**: Default $18.50/MMBTU (EIA CT residential)

Both configurable in the dashboard settings.

---

## Hardware BOM

| Part | Approx Cost |
|------|-------------|
| ESP32 DevKit V1 | $10 |
| DS18B20 sensors (10-pack) | $15 |
| GREDIA flow meters (x3) | $60 |
| Emporia Vue (16 channel) | $150 |
| Waterproof enclosure | $20 |
| Misc (wire, connectors) | $25 |
| **Total** | **~$280** |

---

## License

Copyright 2024-2025 Schleidt Works. All rights reserved.

[schleidtworks.com](https://schleidtworks.com)
