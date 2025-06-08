import { getSummaryReport } from "../../services/reportService.js";
import {
  generatePDFReport,
  generateExcelReport,
} from "../../utils/reportGenerator.js";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils.js";
import { deleteAttendance } from "../../services/attendanceService.js";

/**
 * Alpine.js component untuk dashboard functionality
 */
export function dashboard() {
  return {
    // State management
    loading: false,
    error: null,
    period: "all",    // Table state properties
    isLoading: false,
    errorMessage: null,
    attendanceData: [],    // Search and pagination properties
    searchQuery: "",
    entriesPerPage: 10,
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

    // Available period options
    periodOptions: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "all", label: "All Time" },
    ],

    /**
     * Initialize component
     */ async init() {
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
        report: [
          {
            id: 1,
            userId: "EMP001",
            name: "John Doe",
            role: "Developer",
            checkIn: "08:00",
            checkOut: "17:00",
            status: "On Time",
            workType: "WFO",
            location: { latitude: -6.2, longitude: 106.816666 },
          },
          {
            id: 2,
            userId: "EMP002",
            name: "Jane Smith",
            role: "Designer",
            checkIn: "08:30",
            checkOut: "17:30",
            status: "Late",
            workType: "WFH",
            location: { latitude: null, longitude: null },
          },
        ],
      };
      console.log("Initial test data set:", this.summaryData);

      await this.loadSummaryData();
    } /**
     * Load summary data dari API
     */,
    async loadSummaryData() {
      this.loading = true;
      this.isLoading = true;
      this.error = null;
      this.errorMessage = null;

      try {
        console.log(`Loading summary data for period: ${this.period}`);
        const response = await getSummaryReport(this.period);

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

          // Extract report data dari nested structure
          const reportData = response.report?.data || response.report || [];          // Map report data to attendanceData format (matching exact API structure)
          this.attendanceData = reportData.map((item, index) => ({
            id_attendance: item.attendance_id || `attendance_${index}`,
            id: item.nip_nim || item.user_id || `EMP${String(index + 1).padStart(3, "0")}`,
            full_name: item.full_name || "Unknown User",
            role_name: item.role || "Employee",
            time_in: item.time_in || null,
            time_out: item.time_out || null,
            work_hour: item.work_hour || this.calculateWorkHours(item.time_in, item.time_out),
            status: item.status || "Present",
            information: item.information || "N/A",
            attendance_date: item.attendance_date || null,
            nip_nim: item.nip_nim || null,
            email: item.email || null,
            notes: item.notes || null,
            phone_number: item.phone_number || null,
            // Location mapping - exact same structure as attendance table expects
            location: {
              latitude: item.location_details?.coordinates?.latitude || null,
              longitude: item.location_details?.coordinates?.longitude || null,
              radius: item.location_details?.radius || 100,
              description: item.location_details?.description || "Location not specified"
            },
            location_description: item.location_details?.description || "Location not specified",
            // Additional location details for compatibility
            latitude: item.location_details?.coordinates?.latitude || null,
            longitude: item.location_details?.coordinates?.longitude || null,
            ...item, // spread any additional fields
          }));this.summaryData = {
            summary: mappedSummary,
            report: reportData,
          };

          // Simpan juga raw API response untuk export
          this.rawApiData = {
            summary: response.summary,
            report: response.report
          };

          console.log("Summary data loaded successfully:", this.summaryData);
          console.log("Attendance data mapped:", this.attendanceData);        } else {
          // For testing: If there's no API yet, use mock data
          this.summaryData = {
            summary: {
              onTime: 21,
              late: 19,
              alpha: 0,
              wfo: 10,
              wfh: 11,
              wfa: 13,
            },
            report: [],
          };

          // Mock raw API data for export
          this.rawApiData = {
            summary: {
              total_ontime: 21,
              total_late: 19,
              total_alpha: 0,
              total_wfo: 10,
              total_wfh: 11,
              total_wfa: 13,
            },
            report: {
              data: [],
              pagination: {
                current_page: 1,
                total_pages: 1,
                total_items: 0,
                items_per_page: 10,
                has_next_page: false,
                has_prev_page: false
              }
            }
          };          // Mock attendance data dengan struktur yang benar sesuai API
          this.attendanceData = [
            {
              id_attendance: "att_001",
              id: "F5512062",
              full_name: "John Doe",
              role_name: "Developer",
              time_in: "08:00",
              time_out: "17:00",
              work_hour: "9 hours",
              status: "ontime",
              information: "Work From Office",
              location: { 
                latitude: -6.1754, 
                longitude: 106.8272,
                radius: 100,
                description: "Kantor Pusat"
              },
              location_description: "Kantor Pusat",
              latitude: -6.1754,
              longitude: 106.8272,
              email: "john.doe@example.com",
              phone_number: "081234567890"
            },
            {
              id_attendance: "att_002",
              id: "F5512063",
              full_name: "Jane Smith",
              role_name: "Designer",
              time_in: "08:30",
              time_out: "17:30",
              work_hour: "9 hours",
              status: "late",
              information: "Work From Home",
              location: { 
                latitude: null, 
                longitude: null,
                radius: 100,
                description: "Location not specified"
              },
              location_description: "Location not specified",
              latitude: null,
              longitude: null,
              email: "jane.smith@example.com",
              phone_number: "081234567891"
            },
          ];

          console.log("Using mock data for summary and attendance");
        }
      } catch (error) {
        console.error("Error loading summary data:", error);
        this.error = error.message;
        this.errorMessage = error.message;        // Fallback to default data on error
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
        
        // Empty raw API data for error case
        this.rawApiData = {
          summary: {
            total_ontime: 0,
            total_late: 0,
            total_alpha: 0,
            total_wfo: 0,
            total_wfh: 0,
            total_wfa: 0,
          },
          report: {
            data: [],
            pagination: {
              current_page: 1,
              total_pages: 1,
              total_items: 0,
              items_per_page: 10,
              has_next_page: false,
              has_prev_page: false
            }
          }
        };
        
        this.attendanceData = [];
      } finally {
        this.loading = false;
        this.isLoading = false;
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
     * Handle period change
     */
    async onPeriodChange() {
      console.log(`Period changed to: ${this.period}`);
      await this.loadSummaryData();
    },    /**
     * Download report as PDF
     */
    async downloadPDF() {
      try {
        console.log("Generating PDF report...");
        
        // Gunakan raw API data jika tersedia, atau fallback ke summaryData
        const dataForExport = this.rawApiData || this.summaryData;
        console.log("Data being sent to PDF generator:", dataForExport);
        
        generatePDFReport(dataForExport, this.period);

        // Show success notification (optional)
        this.showNotification("PDF report downloaded successfully!", "success");
      } catch (error) {
        console.error("Error generating PDF:", error);
        this.showNotification("Failed to generate PDF report", "error");
      }
    },    /**
     * Download report as Excel
     */
    async downloadExcel() {
      try {
        console.log("Generating Excel report...");
        
        // Gunakan raw API data jika tersedia, atau fallback ke summaryData
        const dataForExport = this.rawApiData || this.summaryData;
        console.log("Data being sent to Excel generator:", dataForExport);
        
        generateExcelReport(dataForExport, this.period);

        // Show success notification (optional)
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
    getAvatarColor,    /**
     * View location on map (exact same as attendance table)
     */
    viewLocation(attendanceItem) {
      console.log("Dashboard viewLocation called with:", attendanceItem);
      
      // Siapkan payload untuk modal peta - exactly same structure as attendance table
      const locationPayload = {
        fullName: attendanceItem.full_name || "Unknown User",
        email: attendanceItem.email || "-",
        position: attendanceItem.role_name || "-",
        phoneNumber: attendanceItem.phone_number || "-",
        latitude: attendanceItem.location?.latitude || attendanceItem.latitude,
        longitude: attendanceItem.location?.longitude || attendanceItem.longitude,
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
    },/**
     * Sorting functionality
     */
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
    },    /**
     * Get status badge CSS classes (exact same as attendance table)
     */
    getStatusBadgeClass(status) {
      switch (status?.toLowerCase()) {
        case "late":
          return "inline-flex items-center rounded-full bg-error-50 px-2 py-1 text-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-400";
        case "ontime":
        case "on time":
          return "inline-flex items-center rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-400";
        default:
          return "inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-500/15 dark:text-gray-400";
      }
    },

    /**
     * Get status badge text (exact same as attendance table)
     */
    getStatusBadgeText(status) {
      switch (status?.toLowerCase()) {
        case "late":
          return "Late";
        case "ontime":
        case "on time":
          return "On Time";
        default:
          return "Alpha";
      }
    },    /**
     * Get information badge CSS classes (exact same as attendance table)
     */
    getInfoBadgeClass(info) {
      switch (info?.toLowerCase()) {
        case "wfo":
        case "work from office":
          return "inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
        case "wfh":
        case "work from home":
          return "inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-400";
        default:
          return "inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-500/15 dark:text-gray-400";
      }
    },

    /**
     * Get information badge text (exact same as attendance table)
     */
    getInfoBadgeText(info) {
      switch (info?.toLowerCase()) {
        case "wfo":
          return "Work From Office";
        case "wfh":
          return "Work From Home";
        case "work from office":
          return "Work From Office";
        case "work from home":
          return "Work From Home";
        default:
          return info || "Unknown";
      }
    },    /**
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
          (log) => log.id_attendance !== this.deleteTargetId
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
        }      }
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
      return this.attendanceData.filter(log => {
        // Safe string checking with fallbacks
        const fullName = (log.full_name || '').toLowerCase();
        const id = (log.id || '').toLowerCase();
        const roleName = (log.role_name || '').toLowerCase();
        const status = (log.status || '').toLowerCase();
        const information = (log.information || '').toLowerCase();
        const email = (log.email || '').toLowerCase();
        
        return fullName.includes(query) ||
               id.includes(query) ||
               roleName.includes(query) ||
               status.includes(query) ||
               information.includes(query) ||
               email.includes(query);
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
      return Math.ceil(this.filteredAttendanceData.length / this.entriesPerPage);
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
          pages.push('...');
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
          pages.push('...');
        }

        // Show last page
        if (!pages.includes(total)) {
          pages.push(total);
        }
      }

      return pages;
    },    // =================== DELETE MODAL FUNCTIONALITY ===================

    /**
     * Confirm delete dengan modal (matching attendance table exactly)
     * @param {string} attendanceId - ID absensi yang akan dihapus
     */
    confirmDelete(attendanceId) {
      this.deleteTargetId = attendanceId;
      this.deleteConfirmMessage =
        "Apakah Anda yakin ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.";
      this.isDeleteModalOpen = true;
    },    /**
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
  };
}
