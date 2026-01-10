\
import json
import math
import random
import time
from dataclasses import dataclass, asdict

import paho.mqtt.client as mqtt

# ------------------- Settings -------------------
BROKER_HOST = "localhost"
BROKER_PORT = 1883

TOPIC_STATE = "hydronics/main/state"
TOPIC_CONFIG = "hydronics/config"

BTU_FACTOR = 500.0  # BTU/hr = 500 * GPM * ΔT (water)

@dataclass
class LoopState:
    name: str = "Main Loop"
    supplyF: float = 118.0
    returnF: float = 108.0
    deltaT: float = 10.0
    gpm: float = 3.0
    btuPerHour: float = 500.0 * 3.0 * 10.0
    status: str = "OK (sim)"
    ts: float = 0.0

class Simulator:
    def __init__(self):
        self.state = LoopState()
        self.t0 = time.time()

    def step(self):
        t = time.time() - self.t0

        # Slow wave to feel "real"
        wave = math.sin(t / 15.0) * 0.6
        load = 10.0 + math.sin(t / 10.0) * 2.0  # target deltaT

        # Supply random walk
        self.state.supplyF += random.uniform(-0.08, 0.08) + wave * 0.02

        # Return follows supply - load
        r_target = self.state.supplyF - load
        self.state.returnF += (r_target - self.state.returnF) * 0.05 + random.uniform(-0.06, 0.06)

        self.state.deltaT = self.state.supplyF - self.state.returnF
        self.state.btuPerHour = BTU_FACTOR * self.state.gpm * self.state.deltaT
        self.state.ts = time.time()
        return self.state

sim = Simulator()

def on_connect(client, userdata, flags, rc, properties=None):
    print("MQTT connected with code:", rc)
    client.subscribe(TOPIC_CONFIG)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8").strip()
        data = json.loads(payload) if payload else {}
        if "gpm" in data:
            gpm = float(data["gpm"])
            gpm = max(0.0, min(50.0, gpm))
            sim.state.gpm = gpm
            print(f"Updated GPM -> {sim.state.gpm:.2f}")
    except Exception as e:
        print("Config parse error:", e)

def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()

    print("Publishing to:", TOPIC_STATE)
    print("Listening for config on:", TOPIC_CONFIG)
    print("Press CTRL+C to stop.")

    try:
        while True:
            st = sim.step()
            payload = json.dumps(asdict(st))
            # retain=True so a fresh dashboard immediately shows last-known values
            client.publish(TOPIC_STATE, payload=payload, qos=0, retain=True)
            time.sleep(1.0)
    except KeyboardInterrupt:
        pass
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
