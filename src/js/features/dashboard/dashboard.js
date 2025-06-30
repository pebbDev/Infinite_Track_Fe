import { getSummaryReport } from "../../services/reportService.js";
import {
  generatePDFReport,
  generateExcelReport,
} from "../../utils/reportGenerator.js";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils.js";
import { deleteAttendance } from "../../services/attendanceService.js";
import {
  getStatusBadgeClass,
  getStatusBadgeText,
  getInfoBadgeClass,
  getInfoBadgeText,
} from "../../utils/badgeHelpers.js";

/**
 * Alpine.js component untuk dashboard functionality
 */
export function dashboard() {
  return {
    // State management
    loading: false,
    error: null,
    period: "all",

    // Pagination state
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_records: 0,
      has_prev_page: false,
      has_next_page: false,
      per_page: 5,
    },

    // Filter state
    filters: {
      period: "all",
      page: 1,
      limit: 5,
    },

    // Table state properties
    isLoading: false,
    errorMessage: null,
    attendanceData: [],

    // Search and pagination properties
    searchQuery: "",
    searchTimeout: null,
    entriesPerPage: 5,
    currentPage: 1,

    // Modal states (matching attendance table exactly)
    isDeleteModalOpen: false,
    deleteConfirmMessage: "",
    deleteTargetId: null,

    // Raw API data untuk export
    rawApiData: null,

    // Data properties
    summaryData: {
      summary: {
        onTime: 0,
        late: 0,
        alpha: 0,
        wfo: 0,
        wfh: 0,
        wfa: 0,
      },
      report: [],
    },

    // Summary data untuk card - terpengaruh period filter (cards update when period changes)
    cardSummaryData: {
      onTime: 0,
      late: 0,
      alpha: 0,
      wfo: 0,
      wfh: 0,
      wfa: 0,
    },

    // Summary statistics data untuk tabel - terpengaruh period filter
    summaryStatsData: {
      total_ontime: 0,
      total_late: 0,
      total_alpha: 0,
      total_wfo: 0,
      total_wfh: 0,
      total_wfa: 0,
    },

    // Analytics data (new)
    analyticsData: {
      discipline_index: 0,
      performance_trend: "stable",
      avg_work_hours: 0,
    },

    // Report data for table display
    reportData: [],

    // Available period options
    periodOptions: [
      { value: "all", label: "All Time" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],

    // Sorting functionality
    currentSort: { field: null, direction: "asc" },

    // Pagination (placeholder - should come from API)
    pagination: {
      current_page: 1,
      total_pages: 1,
      per_page: 10,
      total: 0,
    },

    /**
     * Initialize component
     */
    async init() {
      console.log("Dashboard component initialized");

      // Set some initial test data immediately
      this.summaryData = {
        summary: {
          onTime: 25,
          late: 8,
          alpha: 2,
          wfo: 15,
          wfh: 12,
          wfa: 8,
        },
        report: [],
      };

      // Initial card summary data (akan diupdate dari API)
      this.cardSummaryData = {
        onTime: 25,
        late: 8,
        alpha: 2,
        wfo: 15,
        wfh: 12,
        wfa: 8,
      };

      this.analyticsData = {
        discipline_index: 78.5,
        performance_trend: "improving",
        avg_work_hours: 8.2,
      };

      console.log("Initial test data set:", this.summaryData);

      await this.loadSummaryData();
    },

    /**
     * Load summary data dari API - menggunakan period filter untuk semua tampilan dashboard
     */
    async loadSummaryData() {
      this.loading = true;
      this.isLoading = true;
      this.error = null;
      this.errorMessage = null;

      try {
        console.log(
          `Loading dashboard data for page: ${this.filters.page}, search: ${this.searchQuery}, period: ${this.period}`,
        );

        // Gunakan period filter yang dipilih user untuk semua tampilan dashboard
        const response = await getSummaryReport({
          period: this.period, // Menggunakan period filter dari dropdown
          page: this.filters.page,
          limit: this.filters.limit,
          search: this.searchQuery,
        });

        console.log(`Dashboard API call made with period='${this.period}'`);

        // Handle API response format dan mapping field names
        if (response && response.summary) {
          // Map API field names ke component field names
          const mappedSummary = {
            onTime: response.summary.total_ontime || 0,
            late: response.summary.total_late || 0,
            alpha: response.summary.total_alpha || 0,
            wfo: response.summary.total_wfo || 0,
            wfh: response.summary.total_wfh || 0,
            wfa: response.summary.total_wfa || 0,
          };

          // Update card summary data (terpengaruh period filter)
          this.cardSummaryData = { ...mappedSummary };
          console.log(
            `✅ Card summary data updated for period '${this.period}':`,
            this.cardSummaryData,
          );

          // Extract analytics data
          this.analyticsData = response.analytics || {
            discipline_index: 0,
            performance_trend: "stable",
            avg_work_hours: 0,
          };

          // Extract report data dari nested structure
          const reportData = response.report?.data || response.report || [];

          // Update pagination data
          this.pagination = {
            current_page: response.report?.pagination?.current_page || 1,
            total_pages: response.report?.pagination?.total_pages || 1,
            total_records: response.report?.pagination?.total_records || 0,
            has_prev_page: response.report?.pagination?.has_prev_page || false,
            has_next_page: response.report?.pagination?.has_next_page || false,
            per_page: response.report?.pagination?.per_page || 5,
          }; // Map report data to attendanceData format (matching exact API structure)
          this.attendanceData = reportData.map((item, index) => ({
            id_attendance: item.attendance_id || `attendance_${index}`,
            id:
              item.nip_nim ||
              item.user_id ||
              `EMP${String(index + 1).padStart(3, "0")}`,
            full_name: item.full_name || "Unknown User",
            role_name: item.role || "Employee",
            time_in: item.time_in || null,
            time_out: item.time_out || null,
            work_hour:
              item.work_hour ||
              this.calculateWorkHours(item.time_in, item.time_out),
            status: item.status || "Present",
            information:
              item.location_details?.category || item.information || "N/A",
            attendance_date: item.attendance_date || null,
            nip_nim: item.nip_nim || null,
            email: item.email || null,
            notes: item.notes || null,
            phone_number: item.phone_number || null,
            // Discipline data (new)
            discipline_score: item.discipline_score || 0,
            discipline_label: item.discipline_label || "Unknown",
            // Location mapping - exact same structure as attendance table expects
            location: {
              latitude: item.location_details?.coordinates?.latitude || null,
              longitude: item.location_details?.coordinates?.longitude || null,
              radius: item.location_details?.radius || 100,
              description:
                item.location_details?.description || "Location not specified",
            },
            location_description:
              item.location_details?.description || "Location not specified",
            // Additional location details for compatibility
            latitude: item.location_details?.coordinates?.latitude || null,
            longitude: item.location_details?.coordinates?.longitude || null,
            ...item, // spread any additional fields
          }));

          // Also set reportData for table display
          this.reportData = this.attendanceData;
          this.summaryData = {
            summary: mappedSummary,
            report: reportData,
          };

          // Simpan juga raw API response untuk export
          this.rawApiData = {
            summary: response.summary,
            report: response.report,
          };

          console.log("Summary data loaded successfully:", this.summaryData);
          console.log("Attendance data mapped:", this.attendanceData);
        } else {
          // No valid response data
          console.warn("No valid data received from API");
          this.handleEmptyApiResponse();
        }
      } catch (error) {
        console.error("Error loading summary data:", error);
        this.loading = false;
        this.isLoading = false;
        this.errorMessage = error.message;

        // Clear all data and show error state - no mock data fallback
        this.summaryData = null;
        this.attendanceData = [];
        this.rawApiData = null; // Critical: No mock data for export
        this.analyticsData = null;
        this.reportData = [];

        // Reset pagination
        this.pagination = {
          current_page: 1,
          total_pages: 1,
          total_records: 0,
          per_page: 5,
          has_next_page: false,
          has_prev_page: false,
        };

        // Show user-friendly error message
        this.showNotification(
          "Failed to load dashboard data. Please check your connection and try again.",
          "error",
        );
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },

    /**
     * Load data khusus untuk export dengan period filter - ambil SEMUA data
     */
    async loadExportData() {
      try {
        console.log(`Loading export data with period: ${this.period}`);

        const response = await getSummaryReport({
          period: this.period, // Gunakan period yang dipilih user
          page: 1, // Ambil dari halaman pertama
          limit: 10000, // Ambil SEMUA data dengan limit besar
          search: "", // Tidak ada search filter untuk export
        });

        if (response && response.summary) {
          // Update rawApiData untuk export
          const exportData = {
            summary: response.summary,
            report: response.report,
          };

          console.log(`Export data loaded successfully:`, {
            period: this.period,
            summaryStats: response.summary,
            recordCount: response.report?.data?.length || 0,
            totalRecords: response.report?.pagination?.total_records || 0,
          });

          return exportData;
        } else {
          throw new Error("No valid export data received from API");
        }
      } catch (error) {
        console.error("Error loading export data:", error);
        throw error;
      }
    },

    /**
     * Calculate work hours from check in and check out times
     */
    calculateWorkHours(checkIn, checkOut) {
      if (!checkIn || !checkOut) return null;

      try {
        const timeIn = new Date(`2000-01-01T${checkIn}`);
        const timeOut = new Date(`2000-01-01T${checkOut}`);
        const diffMs = timeOut - timeIn;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60),
        );

        return `${diffHours}h ${diffMinutes}m`;
      } catch (error) {
        return null;
      }
    },

    /**
     * Handle period change - mempengaruhi semua tampilan dashboard
     */
    async onPeriodChange() {
      console.log(`🔄 Period filter changed to: ${this.period}`);
      console.log("📊 Reloading dashboard data dengan period filter baru");

      // Period filter mempengaruhi SEMUA tampilan dashboard (cards, table, export)
      // Reload data dashboard dengan period filter baru
      await this.loadSummaryData();

      this.showNotification(
        `Dashboard updated untuk period: ${this.period}`,
        "info",
      );
    },

    /**
     * Change page for pagination
     */
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.pagination.total_pages) {
        this.filters.page = newPage;
        this.loadSummaryData();
      }
    },

    /**
     * Get showing info text for pagination
     */
    get showingInfo() {
      const { current_page, items_per_page, total_items } = this.paginationData;

      if (total_items === 0) {
        return "Showing 0 entries";
      }

      const start = (current_page - 1) * items_per_page + 1;
      const end = Math.min(current_page * items_per_page, total_items);

      return `Showing ${start} to ${end} of ${total_items} entries`;
    },

    /**
     * Get discipline score color class
     */
    getDisciplineScoreColor(score) {
      if (score >= 85) return "bg-green-500"; // Excellent - Green
      if (score >= 70) return "bg-blue-500"; // Good - Blue
      if (score >= 55) return "bg-yellow-500"; // Needs Improvement - Yellow
      return "bg-red-500"; // Poor - Red
    } /**
     * Download report as PDF
     */,
    async downloadPDF() {
      try {
        console.log(`Generating PDF report with period filter: ${this.period}`);

        // Load fresh export data dengan period filter
        const exportData = await this.loadExportData();

        // Validasi bahwa kita memiliki data export yang valid
        if (!exportData || !exportData.summary || !exportData.report) {
          console.error("No valid export data available for PDF");
          this.showNotification(
            "Failed to load export data. Please try again.",
            "error",
          );
          return;
        }

        // Validasi struktur data
        const isValidApiData =
          exportData.summary &&
          (exportData.report.data || exportData.report) &&
          typeof exportData.summary === "object";

        if (!isValidApiData) {
          console.error("Invalid export data structure for PDF");
          this.showNotification(
            "Invalid data structure for PDF export",
            "error",
          );
          return;
        }

        console.log(
          "Valid export data being sent to PDF generator:",
          exportData,
        );
        generatePDFReport(exportData, this.period);

        // Show success notification
        this.showNotification("PDF report downloaded successfully!", "success");
      } catch (error) {
        console.error("Error generating PDF:", error);
        this.showNotification("Failed to generate PDF report", "error");
      }
    },
    /**
     * Download report as Excel
     */
    async downloadExcel() {
      try {
        console.log(
          `Generating Excel report with period filter: ${this.period}`,
        );

        // Load fresh export data dengan period filter
        const exportData = await this.loadExportData();

        // Validasi bahwa kita memiliki data export yang valid
        if (!exportData || !exportData.summary || !exportData.report) {
          console.error("No valid export data available for Excel");
          this.showNotification(
            "Failed to load export data. Please try again.",
            "error",
          );
          return;
        }

        // Validasi struktur data
        const isValidApiData =
          exportData.summary &&
          (exportData.report.data || exportData.report) &&
          typeof exportData.summary === "object";

        if (!isValidApiData) {
          console.error("Invalid export data structure for Excel");
          this.showNotification(
            "Invalid data structure for Excel export",
            "error",
          );
          return;
        }

        console.log(
          "Valid export data being sent to Excel generator:",
          exportData,
        );
        generateExcelReport(exportData, this.period);

        // Show success notification
        this.showNotification(
          "Excel report downloaded successfully!",
          "success",
        );
      } catch (error) {
        console.error("Error generating Excel:", error);
        this.showNotification("Failed to generate Excel report", "error");
      }
    },

    /**
     * Show notification (can be extended with toast library)
     */
    showNotification(message, type = "info") {
      // Simple alert for now - can be replaced with better notification system
      if (type === "success") {
        console.log(`✅ ${message}`);
      } else if (type === "error") {
        console.error(`❌ ${message}`);
        alert(message); // Show error to user
      } else {
        console.info(`ℹ️ ${message}`);
      }
    },

    /**
     * Refresh data
     */
    async refresh() {
      console.log("Refreshing dashboard data...");
      await this.loadSummaryData();
    },

    /**
     * Format date untuk display
     */
    formatDate(dateString) {
      if (!dateString) return "-";
      try {
        return new Date(dateString).toLocaleDateString("id-ID");
      } catch (error) {
        return dateString;
      }
    },

    /**
     * Format time untuk display
     */
    formatTime(timeString) {
      if (!timeString) return "-";
      try {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
          "id-ID",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        );
      } catch (error) {
        return timeString;
      }
    },

    /**
     * Get status badge class
     */
    getStatusClass(status) {
      const statusClasses = {
        "On Time": "bg-green-100 text-green-800",
        Late: "bg-yellow-100 text-yellow-800",
        Alpha: "bg-red-100 text-red-800",
        Present: "bg-green-100 text-green-800",
        Absent: "bg-red-100 text-red-800",
      };

      return statusClasses[status] || "bg-gray-100 text-gray-800";
    },

    /**
     * Get work type badge class
     */
    getWorkTypeClass(workType) {
      const workTypeClasses = {
        WFO: "bg-blue-100 text-blue-800",
        WFH: "bg-purple-100 text-purple-800",
        WFA: "bg-indigo-100 text-indigo-800",
      };
      return workTypeClasses[workType] || "bg-gray-100 text-gray-800";
    },

    /**
     * Get initials dari nama (menggunakan avatarUtils)
     */
    getInitials,

    /**
     * Get avatar color based on name (menggunakan avatarUtils)
     */
    getAvatarColor /**
     * View location on map (exact same as attendance table)
     */,
    viewLocation(attendanceItem) {
      console.log("Dashboard viewLocation called with:", attendanceItem);

      // Siapkan payload untuk modal peta - exactly same structure as attendance table
      const locationPayload = {
        fullName: attendanceItem.full_name || "Unknown User",
        email: attendanceItem.email || "-",
        position: attendanceItem.role_name || "-",
        phoneNumber: attendanceItem.phone_number || "-",
        latitude: attendanceItem.location?.latitude || attendanceItem.latitude,
        longitude:
          attendanceItem.location?.longitude || attendanceItem.longitude,
        radius: attendanceItem.location?.radius || attendanceItem.radius || 100,
        description:
          attendanceItem.location?.description ||
          attendanceItem.location_description ||
          "Lokasi absensi karyawan",
      };

      console.log("Prepared location payload:", locationPayload);

      // Call global function untuk membuka modal peta - exactly same as attendance table
      if (typeof window.openMapDetailModal === "function") {
        console.log("Calling window.openMapDetailModal");
        window.openMapDetailModal(locationPayload);
      } else {
        console.warn("openMapDetailModal function not found");
        // Fallback: tampilkan koordinat dalam alert - exactly same as attendance table
        if (locationPayload.latitude && locationPayload.longitude) {
          alert(
            `Koordinat: ${locationPayload.latitude}, ${locationPayload.longitude}`,
          );
        } else {
          alert("Koordinat lokasi tidak tersedia");
        }
      }
    } /**
     * Sorting functionality
     */,
    currentSort: { field: null, direction: "asc" },

    changeSort(field) {
      if (this.currentSort.field === field) {
        this.currentSort.direction =
          this.currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        this.currentSort.field = field;
        this.currentSort.direction = "asc";
      }

      // Here you can implement actual sorting logic
      console.log("Sorting by:", field, this.currentSort.direction);
    },

    /**
     * Get sort icon (exact same as attendance table)
     */
    getSortIcon(fieldName) {
      if (this.currentSort.field !== fieldName) {
        return ""; // No icon if field is not being sorted
      }

      return this.currentSort.direction === "asc" ? "↑" : "↓";
    },
    /**
     * Pagination (placeholder - should come from API)
     */
    pagination: {
      current_page: 1,
      total_pages: 1,
      per_page: 10,
      total: 0,
    },

    /**
     * Get status badge CSS classes (using universal badge helper)
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
     * Get information badge CSS classes (using universal badge helper)
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
     * Confirm delete dengan modal (exact same as attendance table)
     */
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
        // TODO: Replace with actual API call
        // await deleteAttendance(this.deleteTargetId);

        // For now, just remove from local data
        this.attendanceData = this.attendanceData.filter(
          (log) => log.id_attendance !== this.deleteTargetId,
        );

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

        // Refresh data if needed
        // await this.loadSummaryData();
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
     * Handle empty API response
     */
    handleEmptyApiResponse() {
      console.warn(`API returned empty response for period: ${this.period}`);

      // Reset card summary data hanya jika benar-benar error API
      this.cardSummaryData = {
        onTime: 0,
        late: 0,
        alpha: 0,
        wfo: 0,
        wfh: 0,
        wfa: 0,
      };

      this.summaryData = {
        summary: {
          onTime: 0,
          late: 0,
          alpha: 0,
          wfo: 0,
          wfh: 0,
          wfa: 0,
        },
        report: [],
      };

      this.analyticsData = {
        discipline_index: 0,
        performance_trend: "stable",
        avg_work_hours: 0,
      };

      this.pagination = {
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        per_page: 5,
        has_next_page: false,
        has_prev_page: false,
      };

      // Critical: No raw API data means no export capability
      this.rawApiData = null;
      this.attendanceData = [];
      this.reportData = [];

      this.showNotification("No data available from server", "info");
    },

    // =================== SEARCH AND PAGINATION FUNCTIONALITY ===================

    /**
     * Get filtered attendance data based on search query
     */
    get filteredAttendanceData() {
      if (!this.searchQuery.trim()) {
        return this.attendanceData;
      }

      const query = this.searchQuery.toLowerCase();
      return this.attendanceData.filter((log) => {
        // Safe string checking with fallbacks
        const fullName = (log.full_name || "").toLowerCase();
        const id = (log.id || "").toLowerCase();
        const roleName = (log.role_name || "").toLowerCase();
        const status = (log.status || "").toLowerCase();
        const information = (log.information || "").toLowerCase();
        const email = (log.email || "").toLowerCase();

        return (
          fullName.includes(query) ||
          id.includes(query) ||
          roleName.includes(query) ||
          status.includes(query) ||
          information.includes(query) ||
          email.includes(query)
        );
      });
    },

    /**
     * Get paginated attendance data
     */
    get paginatedAttendanceData() {
      const filtered = this.filteredAttendanceData;
      const startIndex = (this.currentPage - 1) * this.entriesPerPage;
      const endIndex = startIndex + this.entriesPerPage;
      return filtered.slice(startIndex, endIndex);
    },

    /**
     * Get total pages
     */
    get totalPages() {
      return Math.ceil(
        this.filteredAttendanceData.length / this.entriesPerPage,
      );
    },

    /**
     * Get showing info text
     */
    get showingInfo() {
      const filtered = this.filteredAttendanceData;
      const total = filtered.length;

      if (total === 0) {
        return "Showing 0 entries";
      }

      const start = (this.currentPage - 1) * this.entriesPerPage + 1;
      const end = Math.min(this.currentPage * this.entriesPerPage, total);

      return `Showing ${start} to ${end} of ${total} entries`;
    },

    /**
     * Handle search input change
     */
    onSearchChange() {
      this.currentPage = 1; // Reset to first page when searching
      console.log("Search query changed:", this.searchQuery);
    },

    /**
     * Handle entries per page change
     */
    onEntriesPerPageChange() {
      this.currentPage = 1; // Reset to first page when changing entries per page
      console.log("Entries per page changed:", this.entriesPerPage);
    },

    /**
     * Go to previous page
     */
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    /**
     * Go to next page
     */
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    /**
     * Get page numbers for pagination
     */
    getPageNumbers() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;

      if (total <= 7) {
        // Show all pages if total is 7 or less
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Show first page
        pages.push(1);

        if (current > 4) {
          pages.push("...");
        }

        // Show pages around current page
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);

        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) {
            pages.push(i);
          }
        }

        if (current < total - 3) {
          pages.push("...");
        }

        // Show last page
        if (!pages.includes(total)) {
          pages.push(total);
        }
      }

      return pages;
    }, // =================== DELETE MODAL FUNCTIONALITY ===================

    /**
     * Confirm delete dengan modal (matching attendance table exactly)
     * @param {string} attendanceId - ID absensi yang akan dihapus
     */
    confirmDelete(attendanceId) {
      this.deleteTargetId = attendanceId;
      this.deleteConfirmMessage =
        "Apakah Anda yakin ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.";
      this.isDeleteModalOpen = true;
    } /**
     * Execute delete attendance (dipanggil dari modal)
     */,
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
        await this.loadSummaryData();
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
     * Close delete modal
     */
    closeDeleteModal() {
      this.isDeleteModalOpen = false;
      this.deleteTargetId = null;
      this.deleteConfirmMessage = "";
    },

    /**
     * Debounced search function
     */
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.filters.page = 1; // Reset to first page when searching
        this.loadSummaryData();
      }, 300);
    },

    /**
     * Update filters limit and reload data
     */
    changeEntriesPerPage(newLimit) {
      this.filters.limit = newLimit;
      this.filters.page = 1; // Reset to first page
      this.loadSummaryData();
    },

    /**
     * View detail function for attendance record
     */
    viewDetail(log) {
      console.log("Viewing detail for:", log);
      // You can implement a modal or redirect to detail page here
      alert(
        `Viewing detail for ${log.full_name}\nStatus: ${log.status}\nInformation: ${log.information}`,
      );
    },

    /**
     * Open delete modal
     */
    openDeleteModal(attendanceId, fullName) {
      this.deleteTargetId = attendanceId;
      this.deleteConfirmMessage = `Are you sure you want to delete attendance record for ${fullName}?`;
      this.isDeleteModalOpen = true;
    },
  };
}
