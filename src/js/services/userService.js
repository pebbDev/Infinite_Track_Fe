/**
 * User API Service
 * Mengenkapsulasi logika panggilan API untuk manajemen pengguna
 */

import axios from "axios";
import { API_CONFIG, envLog } from "../config/env.js";

// Konfigurasi axios default
axios.defaults.withCredentials = true; // Mengizinkan pengiriman cookie

/**
 * Mengambil daftar pengguna dari API
 * @param {Object} params - Parameter query untuk filtering dan sorting
 * @param {string} params.search - Kata kunci pencarian
 * @param {string} params.sortBy - Field untuk sorting
 * @param {string} params.sortOrder - Urutan sorting (ASC/DESC)
 * @returns {Promise<Array>} - Promise yang resolve dengan array pengguna atau reject dengan error
 */
async function getUsers(params = {}) {
  try {
    envLog("debug", "Fetching users with params:", params);

    // Bangun URL dengan query parameters
    const url = new URL(`${API_CONFIG.BASE_URL}/users`, window.location.origin);

    // Tambahkan parameter query jika ada
    if (params.search) {
      url.searchParams.append("search", params.search);
    }
    if (params.sortBy) {
      url.searchParams.append("sortBy", params.sortBy);
    }
    if (params.sortOrder) {
      url.searchParams.append("sortOrder", params.sortOrder);
    }

    envLog("debug", "Requesting users from URL:", url.toString());

    // Lakukan panggilan GET ke endpoint users
    const response = await axios.get(url.toString());

    // Periksa response dari backend
    if (response.data && response.data.success === true) {
      const users = response.data.data;
      envLog("debug", "Successfully fetched users:", users);
      return users;
    } else {
      // Jika backend mengembalikan success: false
      const errorMessage =
        response.data.message || "Gagal mengambil data pengguna";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error fetching users:", error);

    // Handle different types of errors
    if (error.response) {
      // Error response dari server
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk melihat data pengguna.",
        );
      } else if (status === 500) {
        throw new Error("Terjadi kesalahan server. Silakan coba lagi nanti.");
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengambil data pengguna`;
        throw new Error(message);
      }
    } else if (error.request) {
      // Error karena tidak ada response (network error)
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      // Error lainnya
      throw new Error(error.message || "Terjadi kesalahan yang tidak terduga");
    }
  }
}

/**
 * Mengambil detail pengguna berdasarkan ID
 * @param {string|number} userId - ID pengguna
 * @returns {Promise<Object>} - Promise yang resolve dengan data pengguna atau reject dengan error
 */
async function getUserById(userId) {
  try {
    envLog("debug", "Fetching user by ID:", userId);

    const response = await axios.get(`${API_CONFIG.BASE_URL}/users/${userId}`);

    if (response.data && response.data.success === true) {
      return response.data.data;
    } else {
      const errorMessage =
        response.data.message || "Gagal mengambil detail pengguna";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error fetching user by ID:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 404) {
        throw new Error("Pengguna tidak ditemukan.");
      } else if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk melihat detail pengguna.",
        );
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengambil detail pengguna`;
        throw new Error(message);
      }
    } else if (error.request) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      throw new Error(error.message || "Terjadi kesalahan yang tidak terduga");
    }
  }
}

/**
 * Update data pengguna berdasarkan ID
 * @param {string|number} userId - ID pengguna
 * @param {Object} userData - Data pengguna yang akan diupdate
 * @returns {Promise<Object>} - Promise yang resolve dengan data pengguna yang diupdate atau reject dengan error
 */
async function updateUser(userId, userData) {
  try {
    envLog("debug", "Updating user:", userId, userData);

    const response = await axios.patch(
      `${API_CONFIG.BASE_URL}/users/${userId}`,
      userData,
    );

    if (response.data && response.data.success === true) {
      envLog("debug", "Successfully updated user:", response.data.data);
      return response.data.data;
    } else {
      const errorMessage =
        response.data.message || "Gagal mengupdate data pengguna";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error updating user:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk mengupdate data pengguna.",
        );
      } else if (status === 404) {
        throw new Error("Pengguna tidak ditemukan.");
      } else if (status === 422) {
        throw new Error(data?.message || "Data yang dikirim tidak valid.");
      } else if (status === 500) {
        throw new Error("Terjadi kesalahan server. Silakan coba lagi nanti.");
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengupdate data pengguna`;
        throw new Error(message);
      }
    } else if (error.request) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      throw new Error(error.message || "Terjadi kesalahan yang tidak terduga");
    }
  }
}

/**
 * Hapus pengguna berdasarkan ID
 * @param {string|number} userId - ID pengguna
 * @returns {Promise<Object>} - Promise yang resolve dengan pesan sukses atau reject dengan error
 */
async function deleteUser(userId) {
  try {
    envLog("debug", "Deleting user:", userId);

    const response = await axios.delete(
      `${API_CONFIG.BASE_URL}/users/${userId}`,
    );

    if (response.data && response.data.success === true) {
      envLog("debug", "Successfully deleted user:", userId);
      return response.data;
    } else {
      const errorMessage = response.data.message || "Gagal menghapus pengguna";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error deleting user:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error("Anda tidak memiliki akses untuk menghapus pengguna.");
      } else if (status === 404) {
        throw new Error("Pengguna tidak ditemukan.");
      } else if (status === 500) {
        throw new Error("Terjadi kesalahan server. Silakan coba lagi nanti.");
      } else {
        const message =
          data?.message || `Error ${status}: Gagal menghapus pengguna`;
        throw new Error(message);
      }
    } else if (error.request) {
      throw new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    } else {
      throw new Error(error.message || "Terjadi kesalahan yang tidak terduga");
    }
  }
}

// Export functions
export { getUsers, getUserById, updateUser, deleteUser };
