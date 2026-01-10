# Oil to Air-Water Heat Pump Conversion Journey

A complete documentation of converting a 1994-era home from oil/propane heating to a modern air-to-water heat pump system, including DIY BTU monitoring with ESP32.

## About the Author

**Devin Schleidt** - Energy Consultant | [LinkedIn](https://www.linkedin.com/in/devinschleidt) | [Schleidt Works](https://schleidtworks.com/)

- **Background**: Electro-mechanical training from [Vinal Technical High School](https://vinal.cttech.org/) (Middletown, CT)
- **Education**: B.S. Finance & Economics, Fordham University
- **Current**: Energy efficiency consultant specializing in utility programs, decarbonization, and emerging technologies like high-efficiency heat pumps

I work in energy efficiency consulting, helping utility companies design rebate programs and advising on electrification strategies. This project is me practicing what I preach - and documenting whether an air-to-water heat pump conversion is truly cost-effective compared to staying on oil.

## Project Goal

**Is air-to-water heat pump heating/cooling more cost-effective than oil?**

This project tracks real-world BTU usage and energy costs to answer that question with actual data from my home.

## The Story

In 2022, I purchased a home with completely outdated HVAC and no A/C. The property has three distinct spaces:
- **Main House**
- **Garage** (cinder block construction, one wall below grade)
- **Tenant Space** (above the garage, built in 1994 with better thermal shell)

The previous setup was a mess - **three different propane companies** were servicing the property:
1. One for the main house (no appliance even connected!)
2. One for the fireplace
3. One for the space above the garage

Working in energy efficiency, I wanted to practice what I preach. This project documents my journey to a high-efficiency air-to-water heat pump system.

## Why Air-to-Water Heat Pump?

I chose an air-to-water system for several reasons:
- **High COP** - Close to geothermal efficiency without the well drilling expense
- **Simple Installation** - Mostly PEX connections
- **Easy Serviceability** - If the unit fails, it's just two PEX connections, one 240V connection, and a comm wire
- **Flexibility** - Can serve radiant, fan coils, and snow melt from one system

## System Overview

### Heat Pump
- **[Apollo/MBTEK 5-ton Air-to-Water Heat Pump](https://www.mbtek.com/products/apollo-heatpump-60k-btu)** - 60,000 BTU
  - EVI Inverter DC technology
  - Operates down to -31°F
  - Indoor pumping station with backup electric heat, expansion tank, and pumps built-in

### Air Handlers (AHUs)
| AHU | Location | Pump |
|-----|----------|------|
| AHU 1 | Main House | Dedicated pump |
| AHU 2 | Garage | Shared pump (with AHU 3) |
| AHU 3 | Space above garage | Shared pump (with AHU 2) |

### Snow Melt System
- **[HBX SNO-0600 Control System](https://hbxcontrols.com/products/sno-0600)** - WiFi-enabled snow melt control
- **[Mixing Valve from Alibaba](https://www.alibaba.com/showroom/underfloor-heating-mixing-valve.html)** - Hydronic mixing valve

### Piping
- 6-inch conduit connecting main house to carriage garage
- 1-inch supply line breaking to two 1/2-inch lines

## Lessons Learned

### Condensation is Real!
Everything needs to be insulated! In summer, cooling mode will cause condensation on any uninsulated pipes - literally raining in your basement.

### Three Propane Companies?!
Always audit your utility accounts when buying a home.

### Short Cycling / Idling Discovery
After a year of operation, I noticed via my [Sense energy monitor](https://sense.com/) that the Apollo unit was short cycling. Added an [Emporia Vue](https://www.emporiaenergy.com/) with CT clamps on the Apollo, pump station, and AHU to dig deeper. The data showed the real issue: **the unit was constantly idling** because the TT (thermostat terminal) connection wasn't telling the unit to shut off. Without proper TT/comm wire signaling, the Apollo was just reacting to the undersized 15-gallon buffer tank temperature.

**Solution:**
- Upgraded to 30-gallon buffer tank (installation in progress)
- Adding proper TT/comm wire control back to the Apollo unit

### Apollo/MBTEK Installation Gotchas
The Apollo 5-ton was **not** an easy install despite what the marketing suggests. The installation instructions were lacking. Here are some gotchas for anyone attempting this:

1. **Software startup required** - The unit has to be turned on through software on the control unit. There's no physical power button. Why not just have a button?

2. **240V polarity matching** - The indoor pumping station needs to be on the **same polarity** of 240V as the outdoor unit. If you wire them out of phase, it won't communicate properly.

3. **⚠️ SAFETY WARNING: 240V comm signal** - They use **240V for the communication signal** between the indoor and outdoor units. This is NOT standard in the US where we typically use 24V for HVAC control signals. **This could seriously injure someone** who assumes it's low voltage like standard US HVAC systems. Always verify voltage before touching any wires!

### European-Style Low Temperature Design
This entire install reflects the European approach to hydronic heating, which is very different from traditional American systems:

| | European/Air-to-Water | Traditional American |
|---|---|---|
| **Water Temperature** | ~115°F (46°C) | ~180°F (82°C) |
| **Heat Emitters** | Fan coils, radiant, low-temp radiators | Fin tube baseboard, cast iron radiators |
| **Efficiency** | Higher COP at lower temps | Lower efficiency at high temps |

**Important:** This low-temperature approach likely **will NOT work** with standard American fin tube baseboard radiators, which are designed for 180°F water. The lower water temperature won't provide enough heat output from traditional fin tube.

**Location:** Lyme, CT (ASHRAE Climate Zone 5A - Cool/Humid). Despite our New England winters, the system has performed just fine with the ~115°F supply water temperature using properly sized fan coil AHUs.

## Data & Analysis

### Manual J Load Calculation
Used the **[Hover app](https://hover.to/)** to create a 3D model of my home from smartphone photos, then performed a Manual J load calculation to properly size the heat pump system. This is the ACCA-standard method for residential HVAC sizing.

### Oil Usage Baseline
Used a **[Smart Oil Gauge](https://www.smartoilgauge.com/)** to track gallons consumed vs. outdoor temperature before conversion. This data helped calculate BTU requirements for all zones.

See the [data folder](./data/) for historical usage data.

## Project Structure

```
ESP32-BTU-METER/
├── src/              # ESP32 BTU meter firmware
├── lib/              # Libraries and dependencies
├── docs/
│   ├── equipment/    # Equipment specifications and manuals
│   └── zones/        # Zone-by-zone documentation
├── data/             # Oil usage data, BTU calculations
├── photos/
│   ├── before/       # Original HVAC setup
│   ├── installation/ # Installation progress
│   ├── equipment/    # Equipment photos
│   └── completed/    # Finished installation
├── schematics/       # Wiring diagrams and piping layouts
└── README.md
```

## BTU Monitoring System

This project includes a DIY ESP32-based BTU monitoring system to track real-time energy usage across all zones. See the [src folder](./src/) for firmware.

## Equipment Links

| Component | Link |
|-----------|------|
| Apollo 5-ton Heat Pump | [MBTEK](https://www.mbtek.com/products/apollo-heatpump-60k-btu) / [Apollo Heat Pumps](https://apolloheatpumps.com/products/apollo-5t) |
| HBX Snow Melt Control | [HBX Controls](https://hbxcontrols.com/products/sno-0600) |
| Smart Oil Gauge | [smartoilgauge.com](https://www.smartoilgauge.com/) |
| Sense Energy Monitor | [sense.com](https://sense.com/) |
| Emporia Vue Energy Monitor | [Emporia Energy](https://www.emporiaenergy.com/) / [Amazon](https://www.amazon.com/dp/B08CJGPHL9) |
| Grundfos Circulation Pumps | [Grundfos](https://www.grundfos.com/us) |
| Mixing Valves | [Alibaba Hydronic Valves](https://www.alibaba.com/showroom/underfloor-heating-mixing-valve.html) |
| PEX, Fittings, Pumps, etc. | [SupplyHouse.com](https://www.supplyhouse.com/) |

## Installation Approach

This was a DIY project with some help:
- **Self-installed** with general labor assistance
- **Parts sourced from** [SupplyHouse.com](https://www.supplyhouse.com/) - great for PEX, fittings, circulators, expansion tanks, and all the hydronic supplies
- **Demo help** from my brother for removing old equipment and tanks
- **Sheet metal work** - Hired a sheet metal guy to connect the AHUs to existing ductwork
- **Duct cleaning & insulation** - [Duct Diagnostics](https://ductdiagnostics.com/) cleaned the ducts and wrapped/insulated them for cooling mode (prevents condensation)

## Timeline

This was a multi-year project - the easy part was getting the components, the hard part was finding time to install everything.

### 2022
- Purchased home, discovered HVAC chaos (3 propane companies, outdated everything, no A/C)
- Installed Smart Oil Gauge to baseline oil usage vs. outdoor temperature
- First winter here - survived on the old system while planning the conversion
- Started ordering components for the new system

### 2023
- **Summer 2023** - The big demolition. Cut out the old system, removed oil tanks and old HVAC equipment with help from my brother
- Installed the Apollo air-to-water heat pump and indoor pumping station
- Ran the 6" conduit from main house to carriage garage
- Connected all three AHUs to the new system
- **Thanksgiving 2023** - System fully operational for the heating season

### 2024-2025 - System Expansion & Monitoring (Current Phase)
After living with the system for a year, I identified improvements needed:

**Monitoring Evolution:**
- [Sense energy monitor](https://sense.com/) - good for whole-house, but doesn't provide detailed enough per-circuit data
- Added [Emporia Vue](https://www.emporiaenergy.com/) with CT clamps on specific circuits to dig deeper:
  - Apollo heat pump unit
  - Indoor pumping station
  - AHU
- This detailed monitoring revealed the short cycling issue

**System Upgrades:**
- Upgraded buffer tank from 15 gallons to 30 gallons (installation in progress)
- Need to add comm wire back to Apollo for proper on/off signaling
- **Dedicated [Grundfos pumps](https://www.grundfos.com/us)** for each load (except DHW):
  - AHU 1 (Main House) - dedicated Grundfos pump
  - AHU 2 (Garage) - dedicated Grundfos pump
  - AHU 3 (Above garage) - dedicated Grundfos pump
  - Snow melt - dedicated Grundfos pump
- **ESP32 BTU monitoring** - Building custom meters to get the detailed per-zone BTU data that neither Sense nor Emporia can provide

## License

MIT License
