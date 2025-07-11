/**
 * Attendance Log Feature
 * Mengelola state dan logika untuk halaman log absensi
 */

import {
  getAttendanceLog,
  deleteAttendance,
} from "../../services/attendanceService.js";
import {
  formatDateTime,
  formatTime,
  formatDate,
} from "../../utils/dateTimeFormatter.js";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils.js";
import {
  getStatusBadgeClass,
  getStatusBadgeText,
  getInfoBadgeClass,
  getInfoBadgeText,
} from "../../utils/badgeHelpers.js";

/**
 * Alpine.js data untuk halaman attendance log
 * @returns {Object} - Alpine.js data object
 */
export function attendanceLogAlpineData() {
  return {
    // State data
    attendanceData: [],
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_records: 0,
      has_prev_page: false,
      has_next_page: false,
      per_page: 10,
    },
    filters: {
      search: "",
      sortBy: "time_in",
      sortOrder: "DESC",
      page: 1,
      limit: 10,
    },
    isLoading: true,
    errorMessage: "",

    // Search term untuk input
    searchTerm: "",

    // Modal states
    isDeleteModalOpen: false,
    deleteConfirmMessage: "",
    deleteTargetId: null,

    // Debounce timer untuk search
    searchTimer: null,

    /**
     * Initialize component
     */
    async init() {
      await this.fetchAttendance();
    },

    /**
     * Fetch attendance data dari API
     */
    async fetchAttendance() {
      try {
        this.isLoading = true;
        this.errorMessage = "";

        const response = await getAttendanceLog(this.filters);

        // Update data dan pagination
        this.attendanceData = response.data || [];
        this.pagination = {
          current_page: response.pagination?.current_page || 1,
          total_pages: response.pagination?.total_pages || 1,
          total_records: response.pagination?.total_records || 0,
          has_prev_page: response.pagination?.has_prev_page || false,
          has_next_page: response.pagination?.has_next_page || false,
          per_page: response.pagination?.per_page || 10,
        };
      } catch (error) {
        this.errorMessage = error.message || "Gagal memuat data absensi";
        console.error("Error fetching attendance:", error);

        // Tampilkan modal error
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "danger",
            title: "Gagal Memuat Data Absensi",
            message: this.errorMessage,
            buttonText: "OK",
          });
        }
      } finally {
        this.isLoading = false;
      }
    } /**
     * Handle search input dengan debounce
     */,
    handleSearchInput() {
      // Clear timer sebelumnya
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      // Set timer baru untuk debounce 500ms
      this.searchTimer = setTimeout(() => {
        this.filters.search = this.searchTerm; // Update filters dengan searchTerm
        this.filters.page = 1; // Reset ke halaman pertama
        this.fetchAttendance();
      }, 500);
    },

    /**
     * Debounced search function untuk x-model
     */
    debouncedSearch() {
      this.handleSearchInput();
    },

    /**
     * Change sorting
     * @param {string} newSortBy - Field untuk sorting
     */
    changeSort(newSortBy) {
      // Jika field sama, toggle order
      if (this.filters.sortBy === newSortBy) {
        this.filters.sortOrder =
          this.filters.sortOrder === "ASC" ? "DESC" : "ASC";
      } else {
        this.filters.sortBy = newSortBy;
        this.filters.sortOrder = "DESC"; // Default ke DESC untuk field baru
      }

      this.filters.page = 1; // Reset ke halaman pertama
      this.fetchAttendance();
    },

    /**
     * Change page
     * @param {number} newPage - Nomor halaman baru
     */
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.pagination.total_pages) {
        this.filters.page = newPage;
        this.fetchAttendance();
      }
    } /**
     * Confirm delete dengan modal
     * @param {string} attendanceId - ID absensi yang akan dihapus
     */,
    confirmDelete(attendanceId) {
      this.deleteTargetId = attendanceId;
      this.deleteConfirmMessage =
        "Apakah Anda yakin ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.";
      this.isDeleteModalOpen = true;
    },

    /**
     * Execute delete attendance (dipanggil dari modal)
     */
    async executeDelete() {
      if (!this.deleteTargetId) return;

      try {
        await deleteAttendance(this.deleteTargetId);

        // Tutup modal
        this.isDeleteModalOpen = false;
        this.deleteTargetId = null;

        // Tampilkan modal sukses
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "success",
            title: "Data Absensi Dihapus",
            message: "Data absensi berhasil dihapus dari sistem.",
            buttonText: "OK",
          });
        }

        // Refresh data
        await this.fetchAttendance();
      } catch (error) {
        console.error("Error deleting attendance:", error);

        // Tutup modal
        this.isDeleteModalOpen = false;
        this.deleteTargetId = null;

        // Tampilkan modal error
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "danger",
            title: "Gagal Menghapus Data",
            message:
              error.message || "Terjadi kesalahan saat menghapus data absensi.",
            buttonText: "OK",
          });
        }
      }
    },

    /**
     * View location detail
     * @param {Object} attendanceItem - Data attendance item
     */
    viewLocation(attendanceItem) {
      // Siapkan payload untuk modal peta
      const locationPayload = {
        fullName: attendanceItem.full_name || "Unknown User",
        email: attendanceItem.email || "-",
        position: attendanceItem.role_name || "-",
        phoneNumber: attendanceItem.phone_number || "-",
        latitude: attendanceItem.location?.latitude || attendanceItem.latitude,
        longitude:
          attendanceItem.location?.longitude || attendanceItem.longitude,
        radius: attendanceItem.location?.radius || attendanceItem.radius || 100, // Default radius 100m
        description:
          attendanceItem.location?.description ||
          attendanceItem.location_description ||
          "Lokasi absensi karyawan",
      };

      // Call global function untuk membuka modal peta
      if (typeof window.openMapDetailModal === "function") {
        window.openMapDetailModal(locationPayload);
      } else {
        console.warn("openMapDetailModal function not found");
        // Fallback: tampilkan koordinat dalam alert
        if (locationPayload.latitude && locationPayload.longitude) {
          alert(
            `Koordinat: ${locationPayload.latitude}, ${locationPayload.longitude}`,
          );
        } else {
          alert("Koordinat lokasi tidak tersedia");
        }
      }
    },

    /**
     * Format datetime menggunakan utility function
     * @param {string} isoString - ISO date string
     * @returns {string} - Formatted datetime
     */
    formatDateTime(isoString) {
      return formatDateTime(isoString);
    },

    /**
     * Get status badge class (using universal badge helper)
     */
    getStatusBadgeClass(status) {
      return getStatusBadgeClass(status);
    },

    /**
     * Get status badge text (using universal badge helper)
     */
    getStatusBadgeText(status) {
      return getStatusBadgeText(status);
    },

    /**
     * Get information badge class (using universal badge helper)
     */
    getInfoBadgeClass(info) {
      return getInfoBadgeClass(info);
    },

    /**
     * Get information badge text (using universal badge helper)
     */
    getInfoBadgeText(info) {
      return getInfoBadgeText(info);
    },

    /**
     * Get sort icon
     * @param {string} fieldName - Field name untuk sorting
     * @returns {string} - Icon class atau empty string
     */
    getSortIcon(fieldName) {
      if (this.filters.sortBy !== fieldName) {
        return ""; // Tidak ada icon jika field tidak sedang di-sort
      }

      return this.filters.sortOrder === "ASC" ? "↑" : "↓";
    },

    // Avatar utility functions (imported from utils)
    getInitials,
    getAvatarColor, // Formatting functions for templates
    formatDateTime,
    formatTime,
    formatDate,
  };
}
