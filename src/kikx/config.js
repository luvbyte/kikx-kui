export const muiPath = "home://.config/mui";
export const defaultBackground = "images/bg.png";

// ----------------

export const DEV = process.env.NODE_ENV !== "production";

const { protocol, hostname, port } = window.location;

export const apiUrl = DEV
  ? "http://localhost:8000"
  : `${protocol}//${hostname}${port ? `:${port}` : ""}`;

export const wsUrl = DEV
  ? "ws://localhost:8000"
  : `${protocol === "https:" ? "wss:" : "ws:"}//${hostname}${port ? `:${port}` : ""}`;

// ----------------

// Get url
export const getUrl = end => {
  let endUrl = end.startsWith("/") ? end : "/" + end;

  return apiUrl + endUrl;
};

export const getImageUrl = url => {
  if (url.startsWith("/")) {
    return apiUrl + url;
  } else if (url.startsWith("http")) {
    return url;
  }
  return DEV ? "/" + url : url;
};

export const getAudioUrl = url => {
  if (url.startsWith("/")) {
    return apiUrl + url;
  } else if (url.startsWith("http")) {
    return url;
  }
  return DEV ? "/" + url : url;
};
