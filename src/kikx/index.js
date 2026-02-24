import { Client } from "./client";
import { blobToText } from "./utils";

import { getUrl, muiPath, defaultBackground, DEV } from "./config";

import { useUIConfig } from "@/stores/kikx";

import { toRaw } from "vue";

import { z } from "zod";

// Validation scheme
const muiConfigSchema = z.object({
  bg: z.string(),

  isSilent: z.boolean(),
  canToast: z.boolean(),
  iScreen: z.boolean(),
  stickBar: z.boolean(),
  navbar: z.boolean()
});

const client = new Client();

// Fetch apps list
async function fetchAppsList() {
  const res = await fetch(getUrl("/api/apps/list"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: client.clientID
    })
  });

  return await res.json();
}

const muiConfig = {
  configFilePath: muiPath + "/config.json",

  // Get object from store values
  getConfig() {
    const uiConfigStore = useUIConfig();
    return toRaw(uiConfigStore.state);
  },

  // Assign object values to store values
  parseConfig(data) {
    const uiConfigStore = useUIConfig();
    const validated = muiConfigSchema.parse(data);
    uiConfigStore.$patch(store => {
      Object.assign(store.state, validated);
    });
  },

  // Load config
  async load() {
    try {
      const res = await client.fs.readFile(this.configFilePath);
      if (!res.data) {
        throw Error("Data not found");
      }
      const data = JSON.parse(await blobToText(res.data));
      this.parseConfig(data);
    } catch (err) {
      console.log("Error loading config: ", err);
      await this.save();
    }
  },

  // Save config
  async save() {
    const config = await this.getConfig();
    await client.fs.createDirectory(muiPath);
    await client.fs.writeFile(this.configFilePath, JSON.stringify(config));

    console.log("Config saved: ", config);
  }
};

export async function devLogin(key, ui = "mui") {
  if (!DEV) return;
  try {
    // const res = await fetch("http://localhost:8000/generate?key=" + key);
    const res = await fetch(getUrl(`/generate?key=${key}&ui=${ui}`));
    const { access_token } = await res.json();
    document.cookie = `access_token=${access_token}`;
  } catch (err) {
    console.error("Login error:", err);
  }
}

function useClient() {
  return client;
}

function getFS() {
  return useClient().fs;
}
function getSystem() {
  return useClient().system;
}

export { useClient, getFS, getSystem, muiConfig, fetchAppsList };
