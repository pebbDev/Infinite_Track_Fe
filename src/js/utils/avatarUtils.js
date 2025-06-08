/**
 * Avatar Utilities
 * Utility functions for generating user initials and avatar colors
 */

/**
 * Get user initials from full name
 * @param {string} fullName - Full name of the user
 * @returns {string} - User initials (max 2 characters)
 */
export function getInitials(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "??";
  }

  const names = fullName.trim().split(/\s+/);

  if (names.length === 1) {
    // Single name: take first 2 characters
    return names[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple names: take first character of first and last name
    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }
}

/**
 * Get avatar background color based on user name
 * Uses light background colors with darker text (similar to user table style)
 * @param {string} fullName - Full name of the user
 * @returns {string} - CSS classes for background and text color
 */
export function getAvatarColor(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "bg-gray-100 text-gray-600";
  }

  // Array of predefined light color combinations (background + text)
  const colors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-yellow-100 text-yellow-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-orange-100 text-orange-600",
    "bg-cyan-100 text-cyan-600",
    "bg-teal-100 text-teal-600",
  ];

  // Generate a consistent hash from the name
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use hash to select a color (ensure positive index)
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

/**
 * Get avatar color based on user ID (for backward compatibility)
 * @param {string|number} userId - ID of the user
 * @returns {string} - CSS classes for background and text color
 */
export function getAvatarColorById(userId) {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-red-100 text-red-600",
    "bg-yellow-100 text-yellow-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
  ];

  const index = (userId ? userId.toString().length : 0) % colors.length;
  return colors[index];
}
