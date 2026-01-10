# Data Files

This folder contains energy usage data collected during the oil-to-heat-pump conversion project.

## Oil Usage Baseline Data

The Smart Oil Gauge tracked gallons consumed vs. outdoor temperature before conversion. This data was used to calculate BTU requirements for each zone.

### Expected Files

- `oil_usage_raw.csv` - Raw data export from Smart Oil Gauge
- `btu_calculations.xlsx` - BTU analysis spreadsheet
- `outdoor_temps.csv` - Outdoor temperature data correlated with usage

## How to Add Data

1. Export data from your Smart Oil Gauge app
2. Place the CSV file in this folder
3. Update this README with any notes about the data

## BTU Calculation Method

BTU = Gallons × 140,000 (BTU per gallon of heating oil)

Heating degree days (HDD) and outdoor temperature correlation helps estimate:
- Heat loss coefficient of the building
- Required BTU capacity for heat pump sizing
