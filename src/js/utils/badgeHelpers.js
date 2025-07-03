/**
 * Universal Badge Helpers for consistent styling across the application
 * Based on "With Light Background" style from badge.html
 */

// Status Badge Helper - for attendance status (ontime, late, early, alpha)
export function getStatusBadgeClass(status) {
  if (!status)
    return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "ontime":
    case "on time":
    case "tepat waktu":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 px-2.5 py-0.5 text-sm font-medium";

    case "late":
    case "telat":
    case "terlambat":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 px-2.5 py-0.5 text-sm font-medium";

    case "early":
    case "lebih awal":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 px-2.5 py-0.5 text-sm font-medium";

    case "alpha":
    case "absent":
    case "tidak hadir":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400 px-2.5 py-0.5 text-sm font-medium";

    default:
      return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";
  }
}

export function getStatusBadgeText(status) {
  if (!status) return "Unknown";

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "ontime":
    case "on time":
      return "On Time";
    case "late":
      return "Late";
    case "early":
      return "Early";
    case "alpha":
    case "absent":
      return "Absent";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Information Badge Helper - for work type/category information
export function getInfoBadgeClass(info) {
  if (!info)
    return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";

  const infoLower = info.toLowerCase();

  // Work location categories
  if (
    infoLower.includes("work from office") ||
    infoLower.includes("wfo") ||
    infoLower === "office"
  ) {
    return "inline-flex items-center justify-center gap-1 rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400 px-2.5 py-0.5 text-sm font-medium";
  }

  if (
    infoLower.includes("work from home") ||
    infoLower.includes("wfh") ||
    infoLower === "home"
  ) {
    return "inline-flex items-center justify-center gap-1 rounded-full bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 px-2.5 py-0.5 text-sm font-medium";
  }

  if (
    infoLower.includes("work from anywhere") ||
    infoLower.includes("wfa") ||
    infoLower === "anywhere"
  ) {
    return "inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 px-2.5 py-0.5 text-sm font-medium";
  }

  // Duration-based information
  if (infoLower.includes("duration") || infoLower.includes("hour")) {
    return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";
  }

  // Default for other info
  return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";
}

export function getInfoBadgeText(info) {
  if (!info) return "Unknown";

  // Return original text without any modification
  return info;
}

// Booking Status Badge Helper
export function getBookingStatusBadgeClass(status) {
  if (!status)
    return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "confirmed":
    case "approved":
    case "dikonfirmasi":
    case "disetujui":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 px-2.5 py-0.5 text-sm font-medium";

    case "pending":
    case "waiting":
    case "menunggu":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400 px-2.5 py-0.5 text-sm font-medium";

    case "rejected":
    case "cancelled":
    case "canceled":
    case "ditolak":
    case "dibatalkan":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 px-2.5 py-0.5 text-sm font-medium";

    case "completed":
    case "finished":
    case "selesai":
      return "inline-flex items-center justify-center gap-1 rounded-full bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 px-2.5 py-0.5 text-sm font-medium";

    default:
      return "inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-white/5 dark:text-white/80";
  }
}

export function getBookingStatusBadgeText(status) {
  if (!status) return "Unknown";

  const statusLower = status.toLowerCase();

  switch (statusLower) {
    case "confirmed":
    case "approved":
      return "Confirmed";
    case "pending":
    case "waiting":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    case "completed":
    case "finished":
      return "Completed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Generic Badge Helper for custom use cases
export function getGenericBadgeClass(type, variant = "light") {
  const baseClasses =
    "inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium";

  if (variant === "light") {
    switch (type) {
      case "primary":
        return `${baseClasses} bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400`;
      case "success":
        return `${baseClasses} bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500`;
      case "error":
      case "danger":
        return `${baseClasses} bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500`;
      case "warning":
        return `${baseClasses} bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400`;
      case "info":
        return `${baseClasses} bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500`;
      case "gray":
      case "neutral":
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80`;
    }
  }

  // Add solid variant if needed in the future
  return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80`;
}
/**
 * Returns a background color class based on a suitability score.
 * @param {number | null | undefined} score - The suitability score (0-100).
 * @returns {string} - The Tailwind CSS background color class.
 */
export function getSuitabilityScoreColor(score) {
  if (score === null || score === undefined) {
    return "bg-gray-300 dark:bg-gray-600";
  }
  if (score >= 85) {
    return "bg-success-500"; // Very Good - Green
  }
  if (score >= 70) {
    return "bg-blue-500"; // Good - Blue
  }
  if (score >= 50) {
    return "bg-warning-500"; // Average - Yellow
  }
  return "bg-error-500"; // Poor - Red
}
