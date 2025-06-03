/**
 * User List Alpine.js Component
 * Mengelola state dan logika untuk daftar pengguna dengan data dari API
 */

import { getUsers } from "../../services/userService.js";

/**
 * Data dan metode Alpine.js untuk komponen daftar pengguna
 * @returns {Object} - Objek yang berisi state dan metode Alpine.js
 */
function userListAlpineData() {
  return {
    // State management
    users: [],
    isLoading: false,
    searchQuery: "",
    sortBy: "created_at",
    sortOrder: "DESC",
    errorMessage: "",
    entriesPerPage: 10,
    currentPage: 1,

    // Debounce timer untuk search
    searchTimeout: null,
    // Flag untuk mencegah multiple API calls
    isApiRequestInProgress: false,

    /**
     * Inisialisasi komponen
     */
    async init() {
      console.log("Initializing user list component...");
      await this.fetchUsers();
    } /**
     * Computed: Filter users berdasarkan search query
     */,
    get filteredUsers() {
      // Sementara tidak pakai filter lokal, langsung return users dari API
      return this.users;
    },

    /**
     * Computed: Paginated users untuk ditampilkan
     */
    get paginatedUsers() {
      const start = (this.currentPage - 1) * this.entriesPerPage;
      const end = start + this.entriesPerPage;
      return this.filteredUsers.slice(start, end);
    },

    /**
     * Computed: Total halaman
     */
    get totalPages() {
      return Math.ceil(this.filteredUsers.length / this.entriesPerPage);
    },

    /**
     * Computed: Info showing entries
     */
    get showingInfo() {
      const start = (this.currentPage - 1) * this.entriesPerPage + 1;
      const end = Math.min(
        this.currentPage * this.entriesPerPage,
        this.filteredUsers.length,
      );
      const total = this.filteredUsers.length;

      if (total === 0) return "Showing 0 to 0 of 0 entries";
      return `Showing ${start} to ${end} of ${total} entries`;
    } /**
     * Mengambil data pengguna dari API
     */,
    async fetchUsers() {
      // Cegah multiple API calls
      if (this.isApiRequestInProgress) {
        console.log("API request already in progress, skipping...");
        return;
      }

      try {
        this.isApiRequestInProgress = true;
        this.isLoading = true;
        this.errorMessage = "";

        console.log("Fetching users with params:", {
          search: this.searchQuery,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        });

        // Siapkan parameter
        const params = {};
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim();
        }
        if (this.sortBy) {
          params.sortBy = this.sortBy;
        }
        if (this.sortOrder) {
          params.sortOrder = this.sortOrder;
        } // Panggil API
        const users = await getUsers(params);
        this.users = users || [];

        console.log("Successfully fetched users:", this.users);

        // Transform data untuk menambahkan computed properties
        this.users = this.users.map((user) => ({
          ...user,
          initials: this.getInitials(user.fullName),
          avatarColor: this.getAvatarColor(user.id),
        }));

        // Reset current page jika melebihi total pages
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        this.errorMessage = error.message;
        this.users = [];

        // Tampilkan modal error
        this.showErrorModal(error.message);
      } finally {
        this.isLoading = false;
        this.isApiRequestInProgress = false;
      }
    },

    /**
     * Menginisialisasi debounced search
     */
    initSearch() {
      // Clear timeout sebelumnya
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Set timeout baru
      this.searchTimeout = setTimeout(() => {
        this.fetchUsers();
      }, 500);
    } /**
     * Menangani perubahan search query
     */,
    onSearchChange() {
      this.currentPage = 1; // Reset ke halaman pertama
      if (this.searchQuery.trim() === "") {
        // Jika search kosong, langsung fetch tanpa debounce
        this.fetchUsers();
      } else {
        // Gunakan debounce untuk search
        this.initSearch();
      }
    },

    /**
     * Menangani perubahan entries per page
     */
    onEntriesPerPageChange() {
      this.currentPage = 1; // Reset ke halaman pertama
    },

    /**
     * Navigasi ke halaman tertentu
     */
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    /**
     * Navigasi ke halaman sebelumnya
     */
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    /**
     * Navigasi ke halaman selanjutnya
     */
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    /**
     * Mendapatkan array nomor halaman untuk pagination
     */
    getPageNumbers() {
      const pages = [];
      const maxPages = Math.min(this.totalPages, 5); // Tampilkan maksimal 5 halaman

      let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

      // Adjust startPage jika endPage mencapai batas
      if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    },

    /**
     * Menangani aksi view pengguna
     */
    viewUser(userId) {
      console.log("View user:", userId);
      // TODO: Implementasi modal view atau navigasi ke detail
    },

    /**
     * Menangani aksi edit pengguna
     */
    editUser(userId) {
      console.log("Edit user:", userId);
      // TODO: Implementasi navigasi ke halaman edit
      // window.location.href = `form-user.html?id=${userId}`;
    },

    /**
     * Menangani aksi hapus pengguna
     */
    deleteUser(userId) {
      console.log("Delete user:", userId);
      if (confirm("Are you sure you want to delete this user?")) {
        // TODO: Implementasi API call untuk delete
        this.users = this.users.filter((user) => user.id !== userId);
      }
    },

    /**
     * Mendapatkan inisial dari nama lengkap untuk avatar
     * @param {string} fullName - Nama lengkap pengguna
     * @returns {string} - Inisial (maksimal 2 karakter)
     */
    getInitials(fullName) {
      if (!fullName) return "U";

      const names = fullName.trim().split(" ");
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      } else {
        return (
          names[0].charAt(0) + names[names.length - 1].charAt(0)
        ).toUpperCase();
      }
    },

    /**
     * Mendapatkan warna avatar berdasarkan ID pengguna
     * @param {string|number} userId - ID pengguna
     * @returns {string} - Class CSS untuk warna background
     */
    getAvatarColor(userId) {
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
    } /**
     * Menampilkan modal error
     * @param {string} message - Pesan error yang akan ditampilkan
     */,
    showErrorModal(message) {
      if (typeof window.showAlertModal === "function") {
        window.showAlertModal({
          type: "danger",
          title: "Terjadi Kesalahan",
          message: message,
          buttonText: "OK",
          showClose: true,
          onOk: () => {
            console.log("Error modal closed");
          },
        });
      } else {
        // Fallback jika modal tidak tersedia
        alert(message);
      }
    },
  };
}

// Export function
export { userListAlpineData };
