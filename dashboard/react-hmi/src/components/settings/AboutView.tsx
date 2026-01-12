/**
 * About View Component
 * System overview, history, and technical documentation
 */

import { CollapsibleSection } from '../common';

export function AboutView() {
  return (
    <div className="about-view">
      <h2 className="font-pixel text-green glow-green" style={{ marginBottom: '16px' }}>
        About Honey Hill HVAC System
      </h2>
      <p className="text-dim" style={{ marginBottom: '24px' }}>
        Air-to-Water Heat Pump Monitoring Dashboard
      </p>

      <CollapsibleSection title="SYSTEM OVERVIEW" defaultOpen>
        <div className="about-content">
          <p>
            The Honey Hill HVAC System is a modern air-to-water heat pump installation serving
            a residential property in Northern New Jersey. The system provides heating and
            domestic hot water through a highly efficient inverter-driven heat pump paired with
            hydronic air handlers.
          </p>

          <div className="about-specs">
            <h4>System Specifications</h4>
            <ul>
              <li><strong>Heat Pump:</strong> Apollo 5-Ton Air-to-Water (MBTEK EVI Inverter)</li>
              <li><strong>Buffer Tank:</strong> 30 Gallon (thermal storage)</li>
              <li><strong>DHW Tank:</strong> 50 Gallon indirect (planned)</li>
              <li><strong>Air Handlers:</strong> 3x Hydronic AHUs (Main House, Garage, Studio)</li>
              <li><strong>Snow Melt:</strong> HBX SNO-0600 Controller with 2 walkway zones</li>
              <li><strong>Circulation Pumps:</strong> 4x Grundfos ALPHA variable speed</li>
              <li><strong>Design COP:</strong> 3.0+ at 35F outdoor temperature</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="PROJECT HISTORY" defaultOpen={false}>
        <div className="about-timeline">
          <div className="timeline-item">
            <div className="timeline-date">2024 Q1</div>
            <div className="timeline-content">
              <h4>Initial Installation</h4>
              <p>Apollo 5-ton heat pump installed with basic manual monitoring. Initial system commissioning and loop balancing completed.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">2024 Q2</div>
            <div className="timeline-content">
              <h4>ESP32 BTU Meter Development</h4>
              <p>Custom ESP32-based BTU metering system developed using DS18B20 temperature sensors and Hall effect flow meters. MQTT integration for real-time data publishing.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">2024 Q3</div>
            <div className="timeline-content">
              <h4>Emporia Vue Integration</h4>
              <p>Added CT clamp monitoring on all circuits via Emporia Vue Gen 2. Enabled real-time power consumption tracking and COP calculations.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">2024 Q4</div>
            <div className="timeline-content">
              <h4>Snow Melt System</h4>
              <p>HBX SNO-0600 controller installed for automated snow melt management. Two walkway zones added with dedicated loop and mixing valve.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">2025 Q1</div>
            <div className="timeline-content">
              <h4>React Dashboard Development</h4>
              <p>Modern React + TypeScript dashboard developed with retro 8-bit aesthetic. Real-time visualization, historical charts, and multi-theme support.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-date">2025 Q1</div>
            <div className="timeline-content">
              <h4>AI Operations Analyst</h4>
              <p>Integrated AI-powered system analysis using Claude/GPT APIs. Automated performance insights, anomaly detection, and efficiency recommendations.</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="HOW IT WORKS" defaultOpen={false}>
        <div className="about-content">
          <h4>Heat Pump Operation</h4>
          <p>
            The Apollo air-to-water heat pump extracts heat from outdoor air and transfers it
            to water circulating through the hydronic system. The inverter-driven compressor
            modulates capacity to match heating demand, maintaining high efficiency across
            varying outdoor temperatures.
          </p>

          <h4>BTU Calculation</h4>
          <p>
            Energy transfer is calculated using the formula: <code>BTU/hr = 500 × GPM × Delta-T</code>
          </p>
          <p>
            Where GPM is gallons per minute of water flow, and Delta-T is the temperature
            difference between supply and return water. This is measured at each zone
            and aggregated for system-wide totals.
          </p>

          <h4>COP (Coefficient of Performance)</h4>
          <p>
            COP measures system efficiency as the ratio of heat output to electrical input:
            <code>COP = BTU Output / (kW Input × 3412)</code>
          </p>
          <p>
            A COP of 3.0 means the system produces 3 units of heat for every 1 unit of
            electrical energy consumed. Higher outdoor temperatures generally yield higher COP.
          </p>

          <h4>Zone Distribution</h4>
          <p>
            The system uses a header manifold to distribute heated water to multiple zones.
            Each zone has its own circulation pump and air handler. The 3-way valve at the
            heat pump directs flow either to the buffer tank (for DHW priority) or directly
            to the space heating header.
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="MONITORING ARCHITECTURE" defaultOpen={false}>
        <div className="about-content">
          <h4>Data Sources</h4>
          <div className="about-architecture">
            <div className="arch-block">
              <div className="arch-title">ESP32 Microcontroller</div>
              <ul>
                <li>10x DS18B20 temperature sensors (OneWire bus)</li>
                <li>5x GREDIA Hall effect flow meters</li>
                <li>1x Pressure transducer (0-30 PSI)</li>
                <li>MQTT publishing every 500ms</li>
              </ul>
            </div>

            <div className="arch-block">
              <div className="arch-title">Emporia Vue Gen 2</div>
              <ul>
                <li>5-channel CT clamp monitoring</li>
                <li>Real-time power consumption (W, kWh)</li>
                <li>Cloud API integration</li>
                <li>5-second polling interval</li>
              </ul>
            </div>

            <div className="arch-block">
              <div className="arch-title">InfluxDB Time Series</div>
              <ul>
                <li>High-resolution data storage</li>
                <li>Historical queries for trends</li>
                <li>Data retention policies</li>
                <li>Grafana integration ready</li>
              </ul>
            </div>

            <div className="arch-block">
              <div className="arch-title">React Dashboard</div>
              <ul>
                <li>Real-time WebSocket updates</li>
                <li>Interactive system schematic</li>
                <li>AI-powered analysis</li>
                <li>Multi-theme support</li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="SCHLEIDT WORKS" defaultOpen={false}>
        <div className="about-content about-credit">
          <p>
            This HVAC monitoring system was designed and developed by <strong>Schleidt Works</strong>,
            an energy consulting practice serving residential, commercial & industrial (C&I),
            government, and utility clients.
          </p>

          <div className="about-services">
            <h4>Services</h4>
            <ul>
              <li><strong>Residential:</strong> High-efficiency HVAC systems, heat pumps, energy monitoring</li>
              <li><strong>Commercial & Industrial:</strong> Building automation, energy management systems, retro-commissioning</li>
              <li><strong>Government:</strong> Energy audits, sustainability planning, LEED/ENERGY STAR consulting</li>
              <li><strong>Utilities:</strong> Demand response programs, load management, smart grid integration</li>
            </ul>
          </div>

          <p>
            Our mission is to help clients across all sectors understand and optimize their energy systems
            through intelligent monitoring, data-driven analysis, and practical recommendations that
            reduce costs and environmental impact.
          </p>

          <div className="about-links">
            <a href="https://schleidtworks.com" target="_blank" rel="noopener noreferrer">
              schleidtworks.com
            </a>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="TECHNICAL CREDITS" defaultOpen={false}>
        <div className="about-content">
          <h4>Software Stack</h4>
          <ul>
            <li><strong>Frontend:</strong> React 19, TypeScript, Vite</li>
            <li><strong>Charts:</strong> Recharts</li>
            <li><strong>Styling:</strong> Custom CSS with CSS Variables</li>
            <li><strong>Fonts:</strong> Press Start 2P, VT323 (retro), Sora (modern)</li>
            <li><strong>AI:</strong> Anthropic Claude, OpenAI GPT</li>
          </ul>

          <h4>Hardware</h4>
          <ul>
            <li><strong>Controller:</strong> ESP32 DevKit V1</li>
            <li><strong>Sensors:</strong> DS18B20 (temp), GREDIA (flow)</li>
            <li><strong>Power Monitor:</strong> Emporia Vue Gen 2</li>
            <li><strong>Protocol:</strong> MQTT (Mosquitto broker)</li>
          </ul>

          <h4>Open Source</h4>
          <p>
            This project leverages numerous open-source libraries and tools. Special thanks
            to the ESP32 Arduino community, the React ecosystem, and all contributors to
            the libraries that make this possible.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
