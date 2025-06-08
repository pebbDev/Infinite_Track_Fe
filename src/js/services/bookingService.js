/**
 * Booking API Service
 * Mengenkapsulasi logika panggilan API untuk manajemen data booking WFA
 */

import axios from "axios";
import { API_CONFIG, envLog } from "../config/env.js";

// Konfigurasi axios default
axios.defaults.withCredentials = true; // Mengizinkan pengiriman cookie

/**
 * Mendapatkan token dari localStorage untuk header Authorization
 * @returns {string|null} - Bearer token atau null jika tidak ada
 */
function getBearerToken() {
  const token = localStorage.getItem("auth_token");
  return token ? `Bearer ${token}` : null;
}

/**
 * Mengambil daftar booking dari API
 * @param {Object} params - Parameter query
 * @param {string} params.status - Filter status (pending, approved, rejected)
 * @param {string} params.search - Kata kunci pencarian nama/role
 * @param {string} params.sortBy - Field untuk sorting (default: 'custom')
 * @param {string} params.sortOrder - Order sorting ('ASC' atau 'DESC', default: 'DESC')
 * @param {number} params.page - Halaman (default: 1)
 * @param {number} params.limit - Jumlah data per halaman (default: 10)
 * @returns {Promise} - Promise yang resolve dengan data booking dan pagination
 */
export async function getBookings(params = {}) {
  try {
    // Buat query string dari parameter
    const queryParams = new URLSearchParams();

    if (params.status) {
      queryParams.append("status", params.status);
    }
    if (params.search) {
      queryParams.append("search", params.search);
    }
    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }
    if (params.page) {
      queryParams.append("page", params.page);
    }
    if (params.limit) {
      queryParams.append("limit", params.limit);
    }

    const url = `${API_CONFIG.BASE_URL}/bookings${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    envLog("info", "GET Bookings:", { url, params });

    // Setup headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Tambahkan Authorization header jika ada token
    const bearerToken = getBearerToken();
    if (bearerToken) {
      headers.Authorization = bearerToken;
    }

    const response = await axios.get(url, { headers });

    envLog("info", "Bookings Response:", response.data);

    return response.data;
  } catch (error) {
    envLog("error", "Error fetching bookings:", error);

    // Format error untuk penggunaan yang lebih mudah
    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Gagal mengambil data booking";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      throw new Error("Terjadi kesalahan saat mengambil data booking");
    }
  }
}

/**
 * Update status booking
 * @param {string|number} bookingId - ID booking yang akan diupdate
 * @param {string} status - Status baru (approved, rejected)
 * @returns {Promise} - Promise yang resolve dengan response data
 */
export async function updateBookingStatus(bookingId, status) {
  try {
    if (!bookingId) {
      throw new Error("ID booking tidak valid");
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      throw new Error("Status tidak valid");
    }

    const url = `${API_CONFIG.BASE_URL}/bookings/${bookingId}`;

    envLog("info", "PATCH Booking Status:", { url, bookingId, status });

    // Setup headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Tambahkan Authorization header jika ada token
    const bearerToken = getBearerToken();
    if (bearerToken) {
      headers.Authorization = bearerToken;
    }

    const response = await axios.patch(url, { status }, { headers });

    envLog("info", "Update Booking Status Response:", response.data);

    return response.data;
  } catch (error) {
    envLog("error", "Error updating booking status:", error);

    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Gagal mengupdate status booking";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      throw new Error("Terjadi kesalahan saat mengupdate status booking");
    }
  }
}

/**
 * Menghapus data booking berdasarkan ID
 * @param {string|number} bookingId - ID booking yang akan dihapus
 * @returns {Promise} - Promise yang resolve dengan response data
 */
export async function deleteBooking(bookingId) {
  try {
    if (!bookingId) {
      throw new Error("ID booking tidak valid");
    }

    const url = `${API_CONFIG.BASE_URL}/bookings/${bookingId}`;

    envLog("info", "DELETE Booking:", { url, bookingId });

    // Setup headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Tambahkan Authorization header jika ada token
    const bearerToken = getBearerToken();
    if (bearerToken) {
      headers.Authorization = bearerToken;
    }

    const response = await axios.delete(url, { headers });

    envLog("info", "Delete Booking Response:", response.data);

    return response.data;
  } catch (error) {
    envLog("error", "Error deleting booking:", error);

    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Gagal menghapus data booking";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      throw new Error("Terjadi kesalahan saat menghapus data booking");
    }
  }
}
