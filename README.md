# Oil to Air-Water Heat Pump Conversion Journey

A complete documentation of converting a 1994-era home from oil/propane heating to a modern air-to-water heat pump system, including DIY BTU monitoring with ESP32.

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

## Data & Analysis

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

## License

MIT License
