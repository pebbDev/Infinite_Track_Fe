/**
 * User API Service
 * Mengenkapsulasi logika panggilan API untuk manajemen pengguna
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.token || null;
}

/**
 * Membuat header Authorization dengan Bearer token
 * @returns {Object} - Headers object dengan Authorization atau empty object
 */
function getAuthHeaders() {
  const token = getBearerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
 * @param {FormData} formData - FormData object yang berisi data pengguna yang akan diupdate
 * @returns {Promise<Object>} - Promise yang resolve dengan data pengguna yang diupdate atau reject dengan error
 */
async function updateUser(userId, formData) {
  try {
    envLog("debug", "Updating user:", userId);

    // Debug: log form data contents
    for (let [key, value] of formData.entries()) {
      envLog("debug", `FormData ${key}:`, value);
    }

    const response = await axios.patch(
      `${API_CONFIG.BASE_URL}/users/${userId}`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
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

/**
 * Membuat pengguna baru
 * @param {FormData} formData - FormData object yang sudah berisi semua data pengguna dan file
 * @returns {Promise<Object>} - Promise yang resolve dengan data pengguna baru atau reject dengan error
 */
async function createUser(formData) {
  try {
    envLog("debug", "Creating new user with FormData");

    // Debug: log form data contents
    for (let [key, value] of formData.entries()) {
      envLog("debug", `FormData ${key}:`, value);
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/users`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (response.data && response.data.success === true) {
      envLog("debug", "Successfully created user:", response.data.data);
      return response.data.data;
    } else {
      const errorMessage =
        response.data.message || "Gagal membuat pengguna baru";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error creating user:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error("Anda tidak memiliki akses untuk membuat pengguna.");
      } else if (status === 422) {
        throw new Error(data?.message || "Data yang dikirim tidak valid.");
      } else if (status === 500) {
        throw new Error("Terjadi kesalahan server. Silakan coba lagi nanti.");
      } else {
        const message =
          data?.message || `Error ${status}: Gagal membuat pengguna baru`;
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
 * Mengambil daftar roles dari API dengan caching
 * @returns {Promise<Array>} - Promise yang resolve dengan array roles
 */
async function getRoles() {
  try {
    envLog("debug", "Fetching roles from API");

    // Check cache first
    const cacheKey = "roles_cache";
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTTL) {
        envLog("debug", "Using cached roles data");
        return data;
      }
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/roles`, {
      headers: getAuthHeaders(),
    });

    if (response.data && response.data.success === true) {
      const roles = response.data.data;

      // Cache the data
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: roles,
          timestamp: Date.now(),
        }),
      );

      envLog("debug", "Successfully fetched roles:", roles);
      return roles;
    } else {
      const errorMessage =
        response.data.message || "Gagal mengambil data roles";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error fetching roles:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error("Anda tidak memiliki akses untuk melihat data roles.");
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengambil data roles`;
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
 * Mengambil daftar programs dari API dengan caching
 * @returns {Promise<Array>} - Promise yang resolve dengan array programs
 */
async function getPrograms() {
  try {
    envLog("debug", "Fetching programs from API");

    // Check cache first
    const cacheKey = "programs_cache";
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTTL) {
        envLog("debug", "Using cached programs data");
        return data;
      }
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/programs`, {
      headers: getAuthHeaders(),
    });

    if (response.data && response.data.success === true) {
      const programs = response.data.data;

      // Cache the data
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: programs,
          timestamp: Date.now(),
        }),
      );

      envLog("debug", "Successfully fetched programs:", programs);
      return programs;
    } else {
      const errorMessage =
        response.data.message || "Gagal mengambil data programs";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error fetching programs:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk melihat data programs.",
        );
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengambil data programs`;
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
 * Mengambil daftar positions berdasarkan program ID dari API
 * @param {string|number} programId - ID program untuk filter positions
 * @returns {Promise<Array>} - Promise yang resolve dengan array positions
 */
async function getPositions(programId = null) {
  try {
    envLog(
      "debug",
      "Fetching positions from API",
      programId ? `for program ${programId}` : "",
    );

    // Build URL with query parameter if programId provided
    const url = new URL(
      `${API_CONFIG.BASE_URL}/positions`,
      window.location.origin,
    );
    if (programId) {
      url.searchParams.append("program_id", programId);
    }

    const response = await axios.get(url.toString(), {
      headers: getAuthHeaders(),
    });

    if (response.data && response.data.success === true) {
      const positions = response.data.data;
      envLog("debug", "Successfully fetched positions:", positions);
      return positions;
    } else {
      const errorMessage =
        response.data.message || "Gagal mengambil data positions";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error fetching positions:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk melihat data positions.",
        );
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengambil data positions`;
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
 * Mengambil daftar divisions dari API dengan caching
 * @returns {Promise<Array>} - Promise yang resolve dengan array divisions
 */
async function getDivisions() {
  try {
    envLog("debug", "Fetching divisions from API");

    // Check cache first
    const cacheKey = "divisions_cache";
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTTL) {
        envLog("debug", "Using cached divisions data");
        return data;
      }
    }

    const response = await axios.get(`${API_CONFIG.BASE_URL}/divisions`, {
      headers: getAuthHeaders(),
    });

    if (response.data && response.data.success === true) {
      const divisions = response.data.data;

      // Cache the data
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: divisions,
          timestamp: Date.now(),
        }),
      );

      envLog("debug", "Successfully fetched divisions:", divisions);
      return divisions;
    } else {
      const errorMessage =
        response.data.message || "Gagal mengambil data divisions";
      throw new Error(errorMessage);
    }
  } catch (error) {
    envLog("error", "Error fetching divisions:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk melihat data divisions.",
        );
      } else {
        const message =
          data?.message || `Error ${status}: Gagal mengambil data divisions`;
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
export {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getRoles,
  getPrograms,
  getPositions,
  getDivisions,
};
