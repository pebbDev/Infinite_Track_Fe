/**
 * User List Alpine.js Component (Simplified)
 * Hanya fokus mengambil data dari API /users tanpa search/filter kompleks
 */

import {
  getUsers,
  updateUser,
  deleteUser,
} from "../../services/userService.js";

/**
 * Data dan metode Alpine.js untuk komponen daftar pengguna
 * @returns {Object} - Objek yang berisi state dan metode Alpine.js
 */
function userListAlpineData() {
  return {
    // State management
    users: [],
    isLoading: false,
    errorMessage: "",
    entriesPerPage: 5,
    currentPage: 1,
    searchQuery: "", // Modal states
    isDeleteModalOpen: false,
    userToDelete: null,
    isDeleting: false,
    deleteConfirmText: "",

    /**
     * Inisialisasi komponen
     */
    async init() {
      console.log("Initializing user list component...");
      await this.fetchUsers();
    } /**
     * Computed: Filtered users berdasarkan search query
     */,
    get filteredUsers() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.users;
      }

      const query = this.searchQuery.toLowerCase().trim();
      return this.users.filter((user) => {
        // Search dalam fullName dan nipNim
        const fullName = (user.fullName || "").toLowerCase();
        const nipNim = (user.nipNim || "").toLowerCase();

        return fullName.includes(query) || nipNim.includes(query);
      });
    } /**
     * Computed: Paginated users untuk ditampilkan
     */,
    get paginatedUsers() {
      const start = (this.currentPage - 1) * this.entriesPerPage;
      const end = start + this.entriesPerPage;
      return this.filteredUsers.slice(start, end);
    },

    /**
     * Computed: Total halaman berdasarkan data yang ada
     */
    get totalPages() {
      const totalData = this.filteredUsers.length;
      if (totalData === 0) return 0;
      return Math.ceil(totalData / this.entriesPerPage);
    },
    /**
     * Computed: Info showing entries dengan logika fleksibel
     */
    get showingInfo() {
      const totalData = this.filteredUsers.length;

      if (totalData === 0) {
        return "Showing 0 to 0 of 0 entries";
      }

      const start = (this.currentPage - 1) * this.entriesPerPage + 1;
      const end = Math.min(this.currentPage * this.entriesPerPage, totalData);

      return `Showing ${start} to ${end} of ${totalData} entries`;
    },

    /**
     * Mengambil data pengguna dari API
     */
    async fetchUsers() {
      try {
        this.isLoading = true;
        this.errorMessage = "";

        console.log("Fetching users from API...");

        // Panggil API tanpa parameter
        const users = await getUsers();
        this.users = users || [];

        console.log("Successfully fetched users:", this.users);
        console.log("Raw API response:", users);
        console.log("Sample user data:", users[0] || "No users found"); // Transform data untuk menambahkan computed properties dan normalisasi field names
        this.users = this.users.map((user) => ({
          ...user,
          // Normalisasi field names untuk kompatibilitas dengan template
          fullName: user.full_name || user.fullName,
          role: user.role_name || user.role,
          position: user.position_name || user.position,
          nipNim: user.nip_nim || user.nipNim,
          phoneNumber: user.phone || user.phoneNumber,
          // Location data mapping
          latitude: user.latitude || null,
          longitude: user.longitude || null,
          radius: user.radius || null,
          description: user.description || null,
          // Computed properties
          initials: this.getInitials(user.full_name || user.fullName),
          avatarColor: this.getAvatarColor(user.id),
        }));

        console.log(
          "Transformed user data:",
          this.users[0] || "No users after transform",
        );

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
      }
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
    } /**
     * Handler untuk perubahan search query
     */,
    onSearchChange() {
      console.log("Search query changed:", this.searchQuery);
      console.log(`Filtered results: ${this.filteredUsers.length} items`);

      // Reset ke halaman pertama ketika search berubah
      this.currentPage = 1;
    } /**
     * Handler untuk perubahan entries per page
     */,
    onEntriesPerPageChange() {
      console.log(`Entries per page changed to: ${this.entriesPerPage}`);
      console.log(`Total data: ${this.filteredUsers.length}`);
      console.log(
        `New total pages will be: ${Math.ceil(this.filteredUsers.length / this.entriesPerPage)}`,
      );

      // Reset ke halaman pertama ketika entries per page berubah
      this.currentPage = 1;
    } /**
     * Mendapatkan array nomor halaman untuk pagination
     * Logic super fleksibel berdasarkan total data dan entries per page
     */,
    getPageNumbers() {
      const totalPages = this.totalPages;
      const pages = [];

      // Jika tidak ada data atau hanya 1 halaman
      if (totalPages <= 1) {
        return totalPages === 1 ? [1] : [];
      }

      // Logic pagination yang sangat fleksibel
      if (totalPages <= 7) {
        // Jika total halaman 7 atau kurang, tampilkan semua
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Jika lebih dari 7 halaman, gunakan smart pagination
        const current = this.currentPage;

        if (current <= 4) {
          // Di awal: tampilkan 1,2,3,4,5
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } else if (current >= totalPages - 3) {
          // Di akhir: tampilkan 5 halaman terakhir
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Di tengah: tampilkan current-2, current-1, current, current+1, current+2
          for (let i = current - 2; i <= current + 2; i++) {
            pages.push(i);
          }
        }
      }

      console.log(
        `Pagination Info: Total Data=${this.filteredUsers.length}, Entries/Page=${this.entriesPerPage}, Total Pages=${totalPages}, Current Page=${this.currentPage}, Showing Pages=[${pages.join(",")}]`,
      );
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
     * Menangani aksi edit pengguna
     */,
    editUser(userId) {
      console.log("Edit user:", userId);
      // Navigate to form page with user ID for editing
      window.location.href = `form-user.html?id=${userId}`;
    },

    /**
     * Menangani aksi hapus pengguna - membuka modal konfirmasi
     */
    deleteUser(userId) {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        this.userToDelete = user;
        this.isDeleteModalOpen = true;
      }
    } /**
     * Menutup modal konfirmasi delete
     */,
    closeDeleteModal() {
      this.isDeleteModalOpen = false;
      this.userToDelete = null;
      this.deleteConfirmText = "";
    },

    /**
     * Konfirmasi dan eksekusi delete user
     */
    async confirmDeleteUser() {
      if (!this.userToDelete) return;

      this.isDeleting = true;
      try {
        await deleteUser(this.userToDelete.id);

        // Hapus user dari array lokal
        this.users = this.users.filter(
          (user) => user.id !== this.userToDelete.id,
        );

        // Adjust current page jika diperlukan
        const totalPages = this.totalPages;
        if (this.currentPage > totalPages && totalPages > 0) {
          this.currentPage = totalPages;
        }

        // Tutup modal
        this.closeDeleteModal();

        // Tampilkan pesan sukses
        this.showSuccessModal(
          `Pengguna "${this.userToDelete.fullName}" berhasil dihapus.`,
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        this.showErrorModal(error.message);
      } finally {
        this.isDeleting = false;
      }
    },

    /**
     * Menampilkan modal sukses
     * @param {string} message - Pesan sukses yang akan ditampilkan
     */
    showSuccessModal(message) {
      if (typeof window.showAlertModal === "function") {
        window.showAlertModal({
          type: "success",
          title: "Berhasil",
          message: message,
          buttonText: "OK",
          showClose: true,
          onOk: () => {
            console.log("Success modal closed");
          },
        });
      } else {
        // Fallback jika modal tidak tersedia
        alert(message);
      }
    },

    /**
     * Menampilkan modal error
     * @param {string} message - Pesan error yang akan ditampilkan
     */
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
