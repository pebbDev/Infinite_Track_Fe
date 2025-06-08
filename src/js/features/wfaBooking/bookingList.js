/**
 * Booking List Feature
 * Mengelola state dan logika untuk halaman daftar booking WFA
 */

import {
  getBookings,
  updateBookingStatus,
  deleteBooking,
} from "../../services/bookingService.js";
import {
  formatDateTime,
  formatDate,
} from "../../utils/dateTimeFormatter.js";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils.js";

/**
 * Alpine.js data untuk halaman booking list
 * @returns {Object} - Alpine.js data object
 */
export function bookingListAlpineData() {
  return {
    // State data
    bookings: [],    pagination: {
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      total_records: 0,
      items_per_page: 10,
      per_page: 10,
      has_next_page: false,
      has_prev_page: false,
    },
    filters: {
      status: "",
      search: "",
      sortBy: "custom",
      sortOrder: "DESC",
      page: 1,
      limit: 10,
    },
    isLoading: true,
    errorMessage: "",

    // Search term untuk input
    searchTerm: "",    // Modal states
    isDeleteModalOpen: false,
    deleteConfirmMessage: "",
    deleteTargetId: null,    // Map modal states  
    isBookingMapModalOpen: false,
    selectedBookingLocation: {
      title: "",
      description: "",
      latitude: null,
      longitude: null,
      radius: null,
    },

    // Legacy map modal (for compatibility)
    isMapDetailModalOpen: false,
    mapDetailPayload: {
      title: "",
      description: "",
      latitude: null,
      longitude: null,
      radius: null,
    },

    // Required for general map modal compatibility
    selectedUserLocation: {
      id: null,
      fullName: "",
      email: "",
      position: "",
      phoneNumber: "",
      latitude: null,
      longitude: null,
      radius: null,
      description: "",
    },

    // Debounce timer untuk search
    searchTimer: null,

    /**
     * Initialize component
     */
    async init() {
      await this.fetchBookings();
    },

    /**
     * Fetch booking data dari API
     */
    async fetchBookings() {
      try {
        this.isLoading = true;
        this.errorMessage = "";        const response = await getBookings(this.filters);
        
        // Map API response to expected template format
        this.bookings = (response.data?.bookings || []).map(booking => ({
          // Map API fields to template expected fields
          id: booking.booking_id,
          employee_name: booking.user_full_name,
          employee_id: booking.user_nip_nim,
          employee_email: booking.user_email,
          employee_position: booking.user_position_name,
          employee_role: booking.user_role_name,
          start_date: booking.schedule_date,
          end_date: booking.schedule_date, // Same as start for single day booking
          schedule_date: booking.schedule_date,
          status: booking.status,
          location_name: booking.location?.description || 'N/A',
          location_latitude: booking.location?.latitude,
          location_longitude: booking.location?.longitude,
          location_radius: booking.location?.radius,
          notes: booking.notes,
          created_at: booking.created_at,
          processed_at: booking.processed_at,
          approved_by: booking.approved_by,
          // Keep original data for reference
          original: booking
        }));
        this.pagination = {
          current_page: response.data?.pagination?.current_page || 1,
          total_pages: response.data?.pagination?.total_pages || 1,
          total_items: response.data?.pagination?.total_items || 0,
          total_records: response.data?.pagination?.total_items || 0, // Alias for table compatibility
          items_per_page: response.data?.pagination?.items_per_page || 10,
          per_page: response.data?.pagination?.items_per_page || 10, // Alias for table compatibility
          has_next_page: (response.data?.pagination?.current_page || 1) < (response.data?.pagination?.total_pages || 1),
          has_prev_page: (response.data?.pagination?.current_page || 1) > 1,
        };
      } catch (error) {
        this.errorMessage = error.message || "Gagal memuat data booking";
        console.error("Error fetching bookings:", error);

        // Tampilkan modal error
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "danger",
            title: "Gagal Memuat Data Booking",
            message: this.errorMessage,
            buttonText: "OK",
          });
        }
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Handle search input dengan debounce
     */
    handleSearchInput() {
      // Clear timer sebelumnya
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      // Set timer baru untuk debounce 500ms
      this.searchTimer = setTimeout(() => {
        this.filters.search = this.searchTerm;
        this.filters.page = 1; // Reset ke halaman pertama
        this.fetchBookings();
      }, 500);
    },

    /**
     * Handle status filter change
     */
    handleStatusFilter() {
      this.filters.page = 1; // Reset ke halaman pertama
      this.fetchBookings();
    },    /**
     * Change page
     * @param {number} newPage - Nomor halaman baru
     */
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.pagination.total_pages) {
        this.filters.page = newPage;
        this.fetchBookings();
      }
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
      this.fetchBookings();
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
    },    /**
     * View location detail
     * @param {Object} booking - Data booking item
     */
    viewLocationDetail(booking) {
      // Siapkan payload untuk modal peta
      const locationData = {
        title: `Lokasi Booking - ${booking.employee_name}`,
        description: booking.location_name || booking.notes || "Lokasi booking WFA",
        latitude: booking.location_latitude,
        longitude: booking.location_longitude,
        radius: booking.location_radius || 100, // Default radius 100m
      };

      // Set state untuk kedua versi (compatibility)
      this.mapDetailPayload = locationData;
      this.selectedBookingLocation = locationData;

      // Buka modal
      this.isMapDetailModalOpen = true;
      this.isBookingMapModalOpen = true;

      // Initialize map setelah modal terbuka
      this.$nextTick(() => {
        if (typeof window.initializeReadOnlyMap === "function") {
          window.initializeReadOnlyMap("booking-location-map", locationData);
        }
      });
    },    /**
     * Close map detail modal
     */
    closeMapDetailModal() {
      this.isMapDetailModalOpen = false;
      this.isBookingMapModalOpen = false;
      
      // Clean up map
      if (typeof window.mapDetailModal?.destroyMap === "function") {
        window.mapDetailModal.destroyMap();
      }
      
      // Reset data
      this.selectedUserLocation = {
        id: null,
        fullName: "",
        email: "",
        position: "",
        phoneNumber: "",
        latitude: null,
        longitude: null,
        radius: null,
        description: "",
      };
    },/**
     * Close booking map modal (alias for compatibility)
     */
    closeBookingMapModal() {
      this.closeMapDetailModal();
    },

    /**
     * Open map detail modal (for general compatibility)
     */
    openMapDetailModal(location) {
      this.selectedUserLocation = {
        id: location.id || null,
        fullName: location.fullName || location.title || "",
        email: "",
        position: "",
        phoneNumber: "",
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius || 100,
        description: location.description || "",
      };
      
      this.isMapDetailModalOpen = true;
      
      this.$nextTick(() => {
        if (this.selectedUserLocation.latitude && this.selectedUserLocation.longitude) {
          if (typeof window.mapDetailModal?.initializeMap === "function") {
            window.mapDetailModal.initializeMap(this.selectedUserLocation);
          }
        }
      });
    },

    /**
     * Approve booking
     * @param {string|number} bookingId - ID booking yang akan diapprove
     */
    async approveBooking(bookingId) {
      try {
        await updateBookingStatus(bookingId, "approved");

        // Tampilkan modal sukses
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "success",
            title: "Booking Disetujui",
            message: "Booking berhasil disetujui.",
            buttonText: "OK",
          });
        }

        // Refresh data
        await this.fetchBookings();
      } catch (error) {
        console.error("Error approving booking:", error);

        // Tampilkan modal error
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "danger",
            title: "Gagal Menyetujui Booking",
            message: error.message || "Terjadi kesalahan saat menyetujui booking.",
            buttonText: "OK",
          });
        }
      }
    },

    /**
     * Reject booking
     * @param {string|number} bookingId - ID booking yang akan direject
     */
    async rejectBooking(bookingId) {
      try {
        await updateBookingStatus(bookingId, "rejected");

        // Tampilkan modal sukses
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "success",
            title: "Booking Ditolak",
            message: "Booking berhasil ditolak.",
            buttonText: "OK",
          });
        }

        // Refresh data
        await this.fetchBookings();
      } catch (error) {
        console.error("Error rejecting booking:", error);

        // Tampilkan modal error
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "danger",
            title: "Gagal Menolak Booking",
            message: error.message || "Terjadi kesalahan saat menolak booking.",
            buttonText: "OK",
          });
        }
      }
    },

    /**
     * Confirm delete dengan modal
     * @param {string|number} bookingId - ID booking yang akan dihapus
     */
    confirmDelete(bookingId) {
      this.deleteTargetId = bookingId;
      this.deleteConfirmMessage =
        "Apakah Anda yakin ingin menghapus data booking ini? Tindakan ini tidak dapat dibatalkan.";
      this.isDeleteModalOpen = true;
    },

    /**
     * Execute delete booking (dipanggil dari modal)
     */
    async executeDelete() {
      if (!this.deleteTargetId) return;

      try {
        await deleteBooking(this.deleteTargetId);

        // Tutup modal
        this.isDeleteModalOpen = false;
        this.deleteTargetId = null;

        // Tampilkan modal sukses
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "success",
            title: "Data Booking Dihapus",
            message: "Data booking berhasil dihapus dari sistem.",
            buttonText: "OK",
          });
        }

        // Refresh data
        await this.fetchBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);

        // Tutup modal
        this.isDeleteModalOpen = false;
        this.deleteTargetId = null;

        // Tampilkan modal error
        if (typeof window.showAlertModal === "function") {
          window.showAlertModal({
            type: "danger",
            title: "Gagal Menghapus Data",
            message: error.message || "Terjadi kesalahan saat menghapus data booking.",
            buttonText: "OK",
          });
        }
      }
    },

    /**
     * Get status badge class
     * @param {string} status - Status booking
     * @returns {string} - CSS classes for status badge
     */
    getStatusBadgeClass(status) {
      switch (status?.toLowerCase()) {
        case "pending":
          return "inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
        case "approved":
          return "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400";
        case "rejected":
          return "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400";
        default:
          return "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      }
    },

    /**
     * Get status badge text
     * @param {string} status - Status booking
     * @returns {string} - Display text for status
     */
    getStatusBadgeText(status) {
      switch (status?.toLowerCase()) {
        case "pending":
          return "Pending";
        case "approved":
          return "Approved";
        case "rejected":
          return "Rejected";
        default:
          return status || "Unknown";
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
     * Format date menggunakan utility function
     * @param {string} isoString - ISO date string
     * @returns {string} - Formatted date
     */
    formatDate(isoString) {
      return formatDate(isoString);
    },

    /**
     * Get user initials menggunakan utility function
     * @param {string} fullName - Full name
     * @returns {string} - User initials
     */
    getInitials(fullName) {
      return getInitials(fullName);
    },

    /**
     * Get avatar color menggunakan utility function
     * @param {string} fullName - Full name
     * @returns {string} - CSS classes for avatar
     */
    getAvatarColor(fullName) {
      return getAvatarColor(fullName);
    },
  };
}
