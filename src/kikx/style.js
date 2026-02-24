const appThemes = {
  dark: "bg-black text-white",
  light: "bg-white text-black",
  transparent: "bg-black/60 text-white",

  default: "bg-black/60 text-white",

  // New themes
  dim: "bg-gray-900 text-gray-100",
  softDark: "bg-zinc-800 text-zinc-200",
  softLight: "bg-gray-100 text-gray-800",

  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  success: "bg-success text-success-content",
  danger: "bg-error text-error-content",
  warning: "bg-warning text-warning-content",
  info: "bg-info text-info-content",

  glass: "bg-white/10 backdrop-blur-sm text-white",
  glassDark: "bg-black/30 backdrop-blur-sm text-white",

  gradientBlue: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white",
  gradientSunset: "bg-gradient-to-r from-orange-400 to-pink-500 text-white",
  gradientEmerald: "bg-gradient-to-r from-emerald-400 to-teal-600 text-white",

  borderedLight: "bg-white text-black border border-gray-200",
  borderedDark: "bg-gray-900 text-white border border-gray-700",

  elevatedLight: "bg-white text-black shadow-lg",
  elevatedDark: "bg-gray-800 text-white shadow-xl",

  muted: "bg-gray-200 text-gray-700",
  highContrast: "bg-black text-yellow-400"
};

// Theme apply to statusbar & navbar
export function getAppTheme(theme) {
  return appThemes[theme] || appThemes.default;
}
