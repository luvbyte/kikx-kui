import {
  generateUUID,
  getCookie,
  setCookie,
  blobToText,
  parseArgsAndKwargs
} from "./utils";

import { wsUrl } from "./config";
import { FileSystemService, SystemService } from "./service";

// Client ID - variables

class Client {
  constructor() {
    this.clientID = null; // global
    this.eventCallbacks = {};
    this.ws = null;

    this.fs = new FileSystemService(this);
    this.system = new SystemService(this);

    // Auto-reconnect
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // ms
    this._reconnectTimer = null;

    this._loggedOut = false;

    // Heartbeat
    // this.heartbeatDelay = 3000; // 3 seconds
    // this._heartbeatTimer = null;

    // Listen for signals
    this.on("signal", signalData => {
      //
    });

    this.on("reconnected", () => {
      this.reconnectAttempts = 0;
    });

    window.addEventListener("app:exit", async () => {
      // app exit
      await this._logout();
      // await this.system.request("close-client", "POST");
    });

    // Browser tab focus
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        // this._forceReconnect("Tab became visible");
        // this._startHeartbeat();
        try {
          this.send({ event: "ping", payload: {} });
        } catch (e) {
          alert("kikx disconnected refresh");
        }
      }
    });
  }

  _forceReconnect(reason = "manual trigger") {
    console.log(reason + " → forcing reconnect...");
    this._clearReconnectTimer();
    this.reconnectAttempts = 0;
    this._connect();
  }

  _connect() {
    if (this.ws) return;

    if (this._loggedOut) throw Error("Cant connect since client logged out");

    const url = `${wsUrl}/client?client_id=${this.clientID}`;
    console.log("Connecting to WebSocket:", url);

    this.ws = new WebSocket(url);

    this.ws.onopen = e => {
      console.log("WebSocket connection opened.");
      this._clearReconnectTimer();
      this._callEvent("ws:onopen", e);
      //this._startHeartbeat();
    };
    this.ws.onmessage = e => {
      try {
        const message = JSON.parse(e.data);
        if (message.event === "connected") {
          this.clientID = message.payload.client_id;
        }
        if (message.event) this._callEvent(message.event, message.payload);
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };
    this.ws.onclose = e => {
      console.warn("WebSocket closed.", e);
      this.ws = null;
      this._callEvent("ws:onclose", e);
      this._scheduleReconnect();
      // this._stopHeartbeat();
    };
    this.ws.onerror = e => {
      console.error("WebSocket error:", e);
      this._callEvent("ws:onerror", e);
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }
  _scheduleReconnect() {
    if (this._reconnectTimer) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("Max reconnect attempts reached.");
      this._callEvent("ws:reconnect_failed");
      return;
    }
    this.reconnectAttempts += 1;
    console.log(
      `Reconnect attempt ${this.reconnectAttempts} in ${this.reconnectDelay}ms`
    );
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this._connect();
    }, this.reconnectDelay);
  }
  _clearReconnectTimer() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  // Heartbeat: check WS every 3 seconds
  // Heartbeat: ping/pong system
  // will he removed
  _startHeartbeat() {
    this._stopHeartbeat(); // clear existing timers

    const sendPing = () => {
      if (!this.ws) {
        console.log("Heartbeat: WS not open, reconnecting...");
        this._forceReconnect("heartbeat");
        return;
      }

      // Send ping as JSON
      this.ws.send(JSON.stringify({ event: "ping", timestamp: Date.now() }));

      // Wait for pong within 3 seconds
      this._heartbeatTimer = setTimeout(() => {
        console.warn("No pong received in 3 seconds. Reconnecting...");
        this._forceReconnect("heartbeat timeout");
      }, this.heartbeatDelay);
    };

    // Send initial ping immediately
    sendPing();
  }
  // will he removed
  _stopHeartbeat() {
    if (this._heartbeatTimer) {
      clearTimeout(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
  }

  run(callback) {
    if (this.ws && this.ws.readyState < WebSocket.CLOSING) return;
    if (typeof callback === "function") this.on("connected", callback);
    this._connect();
  }

  addEvent(event, callback) {
    if (!this.eventCallbacks[event]) this.eventCallbacks[event] = [];
    this.eventCallbacks[event].push(callback);
  }

  on(event, callback) {
    this.addEvent(event, callback);
  }

  _callEvent(event, data = null) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].forEach(fn => fn(data));
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("Cannot send. WebSocket not open.");
    }
  }
  async _logout() {
    this._loggedOut = true;
    if (this.ws) this.ws.close();
    // send logout request
    return await this.system.request("client-logout", "POST");
  }

  async sendAppEvent(event, appID, payload) {
    await this.system.request("client-app-event", "POST", {
      app_id: appID,
      event,
      payload
    });
  }
}

export { Client };
