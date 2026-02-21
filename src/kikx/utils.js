// Generate UUID
export function generateUUID() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r =
      (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >>
      (c === "x" ? 0 : 4);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Get cookie
export const getCookie = name =>
  document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="))
    ?.split("=")[1] || null;

// setCookie
export const setCookie = (name, value) => {
  document.cookie = `${name}=${value}; path=/`;
};

export async function blobToText(blob) {
  const text = await blob.text();
  // console.log(text);
  return text;
}

export function parseArgsAndKwargs(...args) {
  if (
    args.length &&
    typeof args[args.length - 1] === "object" &&
    !Array.isArray(args[args.length - 1])
  ) {
    return { args: args.slice(0, -1), options: args[args.length - 1] };
  }
  return { args, options: {} };
}

export function isAndroidWebView() {
  const ua = navigator.userAgent || "";
  return (
    /\bwv\b/.test(ua) ||
    (/Version\/[\d.]+/.test(ua) && /Chrome\/[\d.]+/.test(ua))
  );
}

// Format timestamp
export function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const date = new Date(timestamp);

  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // --- Recent times ---
  if (diffSec < 60) {
    return diffSec <= 1 ? "Just now" : `${diffSec} seconds ago`;
  }

  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  if (diffHour < 24) {
    return `${diffHour} hours ago`;
  }

  // --- Date formatting helpers ---
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();

  let hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert to 12-hour clock

  const timeStr = `${hour}:${minute} ${ampm}`;

  const thisYear = now.getFullYear();
  const year = date.getFullYear();

  // --- Today ---
  if (diffDay === 0) {
    return timeStr;
  }

  // --- Yesterday or older within same year ---
  if (year === thisYear) {
    return `${month} ${day} at ${timeStr}`;
  }

  // --- Previous years ---
  return `${year} ${month} ${day} at ${timeStr}`;
}
