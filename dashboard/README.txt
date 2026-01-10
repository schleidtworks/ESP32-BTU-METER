Honey Hill MQTT Hydronics Demo (Laptop)
=====================================

What this is
------------
A self-contained demo that:
1) runs a local MQTT broker (Mosquitto) with WebSockets enabled
2) runs a Python "backend" that simulates Supply/Return temps and publishes BTU data to MQTT
3) serves a simple web dashboard that subscribes via MQTT over WebSockets (frontend is decoupled from data)

Quick start (recommended)
-------------------------
Prereqs:
- Docker Desktop
- Python 3.9+

Step 1) Start the MQTT broker (Mosquitto)
----------------------------------------
From this folder:
    docker compose up -d

This starts:
- MQTT TCP:      localhost:1883
- MQTT WebSock:  http://localhost:9001  (ws://localhost:9001)

Step 2) Install Python deps
---------------------------
    python -m venv .venv
    .venv\Scripts\activate        (Windows)
    source .venv/bin/activate      (Mac/Linux)
    pip install -r requirements.txt

Step 3) Run the backend simulator
---------------------------------
    python backend_simulator.py

It publishes retained state messages:
- hydronics/main/state    (JSON payload, retained)

It also listens for config updates:
- hydronics/config        (JSON: {"gpm": 3.5})

Step 4) Run the simple static frontend server
---------------------------------------------
Option A (python built-in):
    python -m http.server 8000

Then open:
    http://localhost:8000/frontend_dashboard.html

Use the GPM buttons; the page publishes to hydronics/config.

Notes
-----
- If you later point the backend at a real ESP32 publisher, keep the same topic structure and JSON schema.
- If your broker lives elsewhere, change BROKER_HOST in backend_simulator.py and the WS_URL in the HTML file.
