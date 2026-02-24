import { getUrl } from "./config";

import { parseArgsAndKwargs } from "./utils";

class Service {
  constructor(name, client) {
    this.serviceName = name;
    this.client = client;
    // Api url
    this.baseURL = getUrl(`/service/${this.serviceName}`);
  }
  async _request(endpoint, method, headers, body) {
    Object.assign(headers, {
      "kikx-client-id": this.client.clientID
    });
    return await fetch(`${this.baseURL}/${endpoint}`, {
      method,
      headers,
      body
    });
  }
  async request(endpoint, method = "GET", body = null, isJson = true) {
    let headers = {};

    // Prepare headers and body if JSON is expected
    if (body && isJson) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    try {
      // Call the internal request method
      const response = await this._request(endpoint, method, headers, body);
      let data = null;

      // Check if Content-Type header is present
      const contentType = response.headers.get("content-type");

      // Parse response data based on content type
      if (contentType) {
        if (contentType.includes("application/json")) {
          data = await response.json();
        } else if (contentType.includes("text/")) {
          data = await response.text();
        } else if (contentType.includes("application/octet-stream")) {
          data = await response.blob(); // or .arrayBuffer() depending on use case
        }
        // Add more types if needed
      }

      return {
        ok: response.ok,
        code: response.status,
        contentType: contentType,
        data: response.ok ? data : null,
        error: response.ok ? null : data || `Error ${response.status}`
      };
    } catch (err) {
      // Catch network or parsing errors
      return {
        code: 500,
        ok: false,
        data: null,
        error: err.message || "Unknown error"
      };
    }
  }
}

export class FileSystemService extends Service {
  constructor(client) {
    super("fs", client);
  }

  listFiles = (directory = "") =>
    this.request(`list?directory=${encodeURIComponent(directory)}`);
  readFile = filename =>
    this.request(`read?filename=${encodeURIComponent(filename)}`);
  writeFile = (filename, content) =>
    this.request("write", "POST", { filename, content });
  uploadFile = file => {
    const formData = new FormData();
    formData.append("file", file);
    return this.request("upload", "POST", formData, false);
  };
  deleteFile = filename =>
    this.request(`delete?filename=${encodeURIComponent(filename)}`, "DELETE");
  createDirectory = dirname =>
    this.request("create_directory", "POST", { dirname });
  deleteDirectory = dirname =>
    this.request(
      `delete_directory?dirname=${encodeURIComponent(dirname)}`,
      "DELETE"
    );
  copy = (source, destination) =>
    this.request("copy", "POST", { source, destination });
  move = (source, destination) =>
    this.request("move", "POST", { source, destination });
  serve = file => this.request(`serve?filename=${encodeURIComponent(file)}`);
}

export class SystemService extends Service {
  constructor(client) {
    super("system", client);
  }
  clientFunc = (name, config) =>
    this.request("client/func", "POST", {
      name,
      config
    });

  func(name, ...args) {
    const parsed = parseArgsAndKwargs(...args);
    return this.clientFunc(name, {
      args: parsed.args,
      options: parsed.options
    });
  }
}
