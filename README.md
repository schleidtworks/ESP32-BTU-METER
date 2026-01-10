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

## Timeline

- **2022** - Purchased home, discovered HVAC chaos
- **2022** - Installed Smart Oil Gauge to baseline usage
- **[Add your milestones]**

## License

MIT License
