# 🏠 Honey Hill HVAC Project - Private Notes

*Last updated: January 2025*

This file captures project context, decisions, and notes from development conversations. Not intended for public documentation - just to maintain continuity.

---

## 👤 Owner
- **Devin Schleidt** (GitHub: schleidtworks)
- Energy efficiency consultant
- Background: Vinal Tech (electro-mechanical), Fordham (Finance/Economics)
- Location: Lyme, CT (ASHRAE Zone 5A)

---

## 🏡 Property Overview
- Purchased: 2022
- Address: Honey Hill Lane, Lyme, CT
- Built: 1994
- Previous HVAC: Oil heat, no A/C, 3 separate propane companies (mess!)

### Spaces:
1. **Main House** - Primary living space
2. **Garage** - Cinder block construction, one wall below grade (challenging thermal envelope)
3. **700 sq ft Studio** - Above garage, better thermal shell (built 1994)

---

## 📅 Project Timeline

### 2022
- Bought house, discovered HVAC chaos
- Installed Smart Oil Gauge to baseline usage vs outdoor temp
- First winter on old system while planning
- Started ordering components

### 2023
- **Summer** - Demo with brother (removed oil tanks, old HVAC)
- Installed Apollo 5-ton air-to-water heat pump
- Ran 6" conduit from main house to carriage garage
- Connected all 3 AHUs
- **Thanksgiving 2023** - System fully operational

### 2024-2025 (Current)
- Discovered short cycling via Sense energy monitor
- Added Emporia Vue with CT clamps for detailed monitoring
- Diagnosed: Apollo was idling constantly (no TT/comm wire, undersized buffer tank)
- Upgrading buffer tank: 15 gal → 30 gal (in progress)
- Adding dedicated Grundfos pumps for each zone
- Building ESP32 BTU monitoring system
- Adding wall-mounted hydronic units to garage and studio

---

## 🔧 System Architecture

### Heat Pump
- **Apollo/MBTEK 5-ton** (60,000 BTU)
- Indoor pumping station with backup electric heat
- ~115°F supply water (European low-temp design)

### Distribution
| Zone | Equipment | Pump |
|------|-----------|------|
| Main House | AHU 1 | Dedicated Grundfos |
| Garage | AHU 2 | Dedicated Grundfos |
| 700 sq ft Studio | AHU 3 | Dedicated Grundfos |
| Snow Melt | HBX controller + mixing valve | Dedicated Grundfos |
| DHW | (shares main loop) | N/A |

### Piping
- 6" conduit: Main house ↔ Carriage garage
- 1" main supply, breaks to 2× 1/2" branches

### Buffer Tank
- Originally: 15 gallon (too small, caused short cycling)
- Upgraded to: 30 gallon (installation in progress)

---

## ⚠️ Lessons Learned / Gotchas

### Apollo/MBTEK Installation Issues
1. **Software startup only** - No physical power button, must use controller software
2. **240V polarity matching** - Indoor and outdoor units must be same polarity
3. **⚡ 240V COMM SIGNAL** - NOT standard 24V! Shock hazard for US installers expecting low voltage
4. **TT terminal** - Need proper comm wire or unit constantly idles

### General
- **Condensation** - EVERYTHING must be insulated or you get "rain in the basement" during cooling
- **Low temp water (~115°F)** - Won't work with standard US fin tube baseboard or steam
- **Metric flow meters** - Need NPT adapters for US plumbing

---

## 🛠️ Installation Team
- **Self-installed** with general labor help
- **Brother** - Helped with demo (removing tanks, old equipment)
- **Sheet metal contractor** - Connected AHUs to existing ductwork
- **Duct Diagnostics** - Cleaned and insulated ducts for cooling mode

---

## 📦 Parts Sources
- **SupplyHouse.com** - PEX, fittings, Grundfos pumps, expansion tanks (TODO: export order history)
- **MBTEK/Apollo** - Heat pump and pumping station
- **Alibaba** - Mixing valve for snow melt
- **HBX Controls** - Snow melt controller (SNO-0600)
- **Adafruit** - DS18B20 waterproof temp sensors (OneWire, daisy-chainable)
- **Amazon** - GREDIA hall effect flow meters (metric threads, need NPT adapters)

---

## 📊 Monitoring Stack

### Current
- **Sense** - Whole house (not detailed enough)
- **Emporia Vue** - CT clamps on Apollo, pump station, AHU
- **Smart Oil Gauge** - Historical baseline data (pre-conversion)

### Building (ESP32 BTU Meter)
- ESP32 dev board
- DS18B20 temp sensors (supply/return per zone)
- Hall effect flow meters (1" and 1/2")
- MQTT → Web dashboard

---

## 🎮 HMI Dashboard Features (Built)
- Retro 8-bit pixel art aesthetic
- Animated pipe flow (red supply, blue return)
- Live COP calculation
- Yearly COP average
- Loop PSI gauge with alerts
- Pump status for all Grundfos pumps
- Per-zone temp and BTU/hr
- MQTT over WebSockets
- Simulation mode for testing

---

## 📋 TODO
- [ ] Export SupplyHouse.com order history (2023+)
- [ ] Add photos to repo
- [ ] Upload Smart Oil Gauge baseline data
- [ ] Add MQTT publishing to ESP32 firmware
- [ ] Hook up 30-gallon buffer tank
- [ ] Add TT/comm wire to Apollo
- [ ] Install wall-mounted units in garage and studio
- [ ] Document actual costs for ROI analysis

---

## 🎯 Project Goal
**Prove whether air-to-water heat pump is more cost-effective than oil**

Track:
- BTU output per zone
- kWh input (from Emporia)
- Calculate real-world COP
- Compare to oil baseline costs

---

## 🔗 Repo
https://github.com/schleidtworks/ESP32-BTU-METER
