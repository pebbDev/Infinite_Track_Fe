/**
 * Date Time Formatter Utilities
 * Fungsi-fungsi untuk formatting tanggal dan waktu
 */

/**
 * Format ISO date string menjadi format DD-MM-YYYY HH:MM
 * @param {string} isoString - ISO date string (contoh: "2025-06-06T16:35:07.000Z")
 * @returns {string} - Formatted date string atau "-" jika tidak valid
 */
export function formatDateTime(isoString) {
  try {
    if (!isoString || typeof isoString !== "string") {
      return "-";
    }

    const date = new Date(isoString);

    // Cek apakah date valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    // Format ke zona waktu lokal
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "-";
  }
}

/**
 * Combine date and time strings into formatted datetime
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:MM or HH:MM:SS)
 * @returns {string} - Formatted datetime string DD-MM-YYYY HH:MM atau "-" jika tidak valid
 */
export function formatDateTimeFromSeparate(dateString, timeString) {
  try {
    if (
      !dateString ||
      !timeString ||
      typeof dateString !== "string" ||
      typeof timeString !== "string"
    ) {
      return "-";
    }

    // Handle "00:00" case untuk time_out yang belum di-checkout
    if (timeString === "00:00") {
      return "-";
    }

    // Parse date (format: YYYY-MM-DD)
    const dateParts = dateString.split("-");
    if (dateParts.length !== 3) {
      return "-";
    }

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);

    // Parse time (format: HH:MM atau HH:MM:SS)
    const timeParts = timeString.split(":");
    if (timeParts.length < 2) {
      return "-";
    }

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    // Create date object
    const date = new Date(year, month, day, hours, minutes);

    if (isNaN(date.getTime())) {
      return "-";
    }

    // Format output
    const formattedDay = String(date.getDate()).padStart(2, "0");
    const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
    const formattedYear = date.getFullYear();
    const formattedHours = String(date.getHours()).padStart(2, "0");
    const formattedMinutes = String(date.getMinutes()).padStart(2, "0");

    return `${formattedDay}-${formattedMonth}-${formattedYear} ${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    console.warn("Error formatting date time from separate:", error);
    return "-";
  }
}

/**
 * Format ISO date string menjadi format DD-MM-YYYY
 * @param {string} isoString - ISO date string
 * @returns {string} - Formatted date string atau "-" jika tidak valid
 */
export function formatDate(isoString) {
  try {
    if (!isoString || typeof isoString !== "string") {
      return "-";
    }

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      return "-";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "-";
  }
}

/**
 * Format ISO date string menjadi format HH:MM
 * @param {string} timeString - Time string (HH:MM) or ISO date string
 * @returns {string} - Formatted time string atau "-" jika tidak valid
 */
export function formatTime(timeString) {
  try {
    if (!timeString || typeof timeString !== "string") {
      return "-";
    }

    // Jika sudah dalam format HH:MM atau HH:MM:SS, return as is
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    if (timeRegex.test(timeString)) {
      const match = timeString.match(timeRegex);
      const hours = String(match[1]).padStart(2, "0");
      const minutes = String(match[2]).padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    // Jika masih ISO string, parse sebagai Date
    const date = new Date(timeString);

    if (isNaN(date.getTime())) {
      return "-";
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    console.warn("Error formatting time:", error);
    return "-";
  }
}

/**
 * Calculate work hours from time_in and time_out
 * @param {string} timeIn - Time string (HH:MM) or ISO string for clock in time
 * @param {string} timeOut - Time string (HH:MM) or ISO string for clock out time
 * @param {string} attendanceDate - Date string (YYYY-MM-DD) untuk new format
 * @returns {string} - Work hours in "X jam Y menit" format atau "-" jika tidak valid
 */
export function calculateWorkHours(timeIn, timeOut, attendanceDate = null) {
  try {
    if (!timeIn || !timeOut) {
      return "-";
    }

    // Handle "00:00" case untuk time_out yang belum di-checkout
    if (timeOut === "00:00") {
      return "-";
    }

    let dateIn, dateOut;

    // Jika menggunakan format baru (separate date and time)
    if (attendanceDate && timeIn.includes(":") && timeOut.includes(":")) {
      // Parse date
      const dateParts = attendanceDate.split("-");
      if (dateParts.length !== 3) {
        return "-";
      }

      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2]);

      // Parse time in
      const timeInParts = timeIn.split(":");
      const hoursIn = parseInt(timeInParts[0]);
      const minutesIn = parseInt(timeInParts[1]);
      dateIn = new Date(year, month, day, hoursIn, minutesIn);

      // Parse time out
      const timeOutParts = timeOut.split(":");
      const hoursOut = parseInt(timeOutParts[0]);
      const minutesOut = parseInt(timeOutParts[1]);

      // Jika time_out lebih kecil dari time_in, asumsi next day
      if (
        hoursOut < hoursIn ||
        (hoursOut === hoursIn && minutesOut < minutesIn)
      ) {
        dateOut = new Date(year, month, day + 1, hoursOut, minutesOut);
      } else {
        dateOut = new Date(year, month, day, hoursOut, minutesOut);
      }
    } else {
      // Format lama (ISO strings)
      dateIn = new Date(timeIn);
      dateOut = new Date(timeOut);
    }

    if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) {
      return "-";
    }

    const diffMs = dateOut - dateIn;

    if (diffMs < 0) {
      return "-";
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0 && minutes === 0) {
      return "0 menit";
    } else if (hours === 0) {
      return `${minutes} menit`;
    } else if (minutes === 0) {
      return `${hours} jam`;
    } else {
      return `${hours} jam ${minutes} menit`;
    }
  } catch (error) {
    console.warn("Error calculating work hours:", error);
    return "-";
  }
}
