# Honey Hill HVAC Dashboard 🏠❄️🔥

## What is this?

A **retro 8-bit style React dashboard** for monitoring my air-to-water heat pump system at Honey Hill. Built with React 19 + TypeScript + Vite. Features three themes (Retro/Modern/Dark), real-time system schematic, and an AI assistant named **Simon Says** 🤖⚙️🏠 that analyzes system performance.

---

## 🔧 The System

| Component | Details |
|-----------|---------|
| 🌡️ Heat Pump | Apollo 5-Ton Air-to-Water (MBTEK EVI Inverter) |
| 🛢️ Buffer Tank | 30 Gallon thermal storage |
| 🚿 DHW Tank | 50 Gallon indirect (coming soon!) |
| 💨 Air Handlers | 3x Hydronic AHUs - Main House, Garage, Studio |
| ❄️ Snow Melt | HBX SNO-0600 with 2 walkway zones |
| 💧 Pumps | 4x Grundfos ALPHA variable speed |
| 📡 Monitoring | ESP32 + DS18B20 + GREDIA flow meters + Emporia Vue |

---

## ✨ Features

- **Three Themes** - Retro (pixel art 8-bit vibes), Modern (clean Viessmann style), Dark
- **Live System Schematic** - Animated pipes showing flow direction, temps, GPM
- **Simon Says AI** 🤖 - AI ops analyst with Claude or GPT, analyzes day/week/month/year
- **Health Score** - System gets a letter grade (A-F) based on performance
- **BTU/COP Tracking** - Real efficiency numbers, not guesses
- **ESP32 Pin Map** - Visual GPIO layout so I remember what's plugged in where
- **Export Data** - Get the numbers out for analysis

---

## 📅 Changelog

### 2025-01-11 - Major Refactor + Simon Says AI

#### 🤖 Added: AI Operations Analyst - "Simon Says"
- AI panel in Overview tab with health score gauge (0-100, A-F grades)
- Supports both Claude (Anthropic) and GPT (OpenAI) - your pick!
- **Period-specific insights:**
  - 📆 **Daily** - Real-time performance, live COP, what's happening now
  - 📅 **Weekly** - Pattern detection, run hours, cost summary
  - 📆 **Monthly** - Efficiency reports, heating degree days, maintenance reminders
  - 📅 **Yearly** - Seasonal trends, annual costs, savings vs electric baseboard
- Status lights: 🟢 good / 🟡 caution / 🔴 alert
- Auto-refresh every 5 mins
- Works in demo mode without API keys

#### ⚙️ Added: System Settings
- ESP32 DevKit V1 GPIO pin map (finally documented!)
- All sensor configs in one place
- MQTT and AI settings

#### 📖 Added: About Section
- System specs and project history
- How BTU/COP calculations work
- Schleidt Works info - we do Residential, C&I, Government, Utilities

#### 🔧 Improved: System Schematic
- Complete supply AND return piping layout
- Temperature labels on pipes 🌡️
- Flow rate labels (GPM) at key points 💧
- DHW tank placeholder (it's coming!)
- HBX controller node
- Stats box showing total GPM/kW/BTU
- Legend for pipe colors
- BTU display on active equipment

#### 🏗️ Architecture Cleanup
- Went from **1,844 lines in App.tsx** to properly organized components
- 30+ component files now in:
  - `common/` - WeatherIcon, Clock, ThemeToggle, etc
  - `layout/` - Header, Sidebar, TabsBar, AlertsBar
  - `overview/` - Simon Says, Schematic, Heatmap, etc
  - `equipment/` - AhuCard, HeatPumpCard, BufferTankCard
  - `charts/` - CopTrendPanel, AlarmLog
  - `settings/` - ESP32PinMap, SystemSettings, About
- Custom hooks and centralized formatters
- AI service supporting multiple providers

#### 🎨 UI Polish
- Pulsing glow on health score
- Animated status lights
- Better loading spinners
- Smooth fade-in transitions

---

## 🚀 Quick Start

```bash
cd dashboard/react-hmi
npm install
npm run dev
```

Then open http://localhost:5173

---

## 📁 Project Structure

```
react-hmi/
├── src/
│   ├── components/     # 30+ extracted components
│   ├── context/        # HvacContext for state
│   ├── hooks/          # useSmartAlerts, etc
│   ├── services/       # AI service (Claude/GPT)
│   ├── types/          # TypeScript types
│   ├── utils/          # Formatters
│   └── assets/         # SVG equipment sprites
└── CHANGELOG.md        # You are here!
```

---

## 🔑 Optional: AI Keys

For live AI analysis instead of demo mode:

```env
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🏢 Credits

**Built by**: Schleidt Works
**Website**: [schleidtworks.com](https://schleidtworks.com)

We do energy consulting for:
- 🏠 Residential - Heat pumps, efficiency, monitoring
- 🏭 Commercial & Industrial - Building automation, EMS
- 🏛️ Government - Energy audits, sustainability, LEED
- ⚡ Utilities - Demand response, smart grid

---

*Private project - keeping my house warm and my energy bills low* 🔥💰
