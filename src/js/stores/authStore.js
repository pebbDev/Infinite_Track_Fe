/**
 * Alpine.js Authentication Store
 * Store untuk mengelola state autentikasi user
 */

import {
  getUserFromStorage,
  removeUserFromStorage,
} from "../utils/storageManager.js";
import { getCurrentUser, isAuthenticated } from "../services/authService.js";

/**
 * Initialize Authentication Store untuk Alpine.js
 */
function initAuthStore() {
  // Pastikan Alpine.js tersedia
  if (typeof Alpine === "undefined") {
    console.warn("Alpine.js not found. Auth store not initialized.");
    return;
  }

  // Inisialisasi auth store
  Alpine.store("auth", {
    // State
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Getters
    get userName() {
      return this.user?.name || this.user?.username || "User";
    },

    get userEmail() {
      return this.user?.email || "";
    },
    get userRole() {
      return this.user?.role_name || this.user?.role || "user";
    },

    get userAvatar() {
      return (
        this.user?.avatar ||
        this.user?.profile_picture ||
        "/src/images/user/owner.jpg"
      );
    },

    get hasPermission() {
      return (permission) => {
        if (!this.user || !this.user.permissions) return false;
        return this.user.permissions.includes(permission);
      };
    },

    // Actions
    init() {
      // Load user data from storage saat aplikasi dimulai
      this.loadUserFromStorage();
    },

    loadUserFromStorage() {
      try {
        const userData = getUserFromStorage();
        if (userData && isAuthenticated()) {
          this.user = userData;
          this.isAuthenticated = true;
          console.log("User data loaded from storage:", userData);
        } else {
          this.clearAuth();
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        this.clearAuth();
      }
    },

    setUser(userData) {
      this.user = userData;
      this.isAuthenticated = true;
      this.error = null;
      console.log("User data set in auth store:", userData);
    },

    setLoading(isLoading) {
      this.isLoading = isLoading;
    },

    setError(error) {
      this.error = error;
      this.isLoading = false;
    },

    clearAuth() {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      this.isLoading = false;
      removeUserFromStorage();
      console.log("Auth store cleared");
    },

    async refreshUser() {
      try {
        this.setLoading(true);
        const userData = await getCurrentUser();
        if (userData) {
          this.setUser(userData);
        } else {
          this.clearAuth();
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
        this.setError(error.message);
        this.clearAuth();
      } finally {
        this.setLoading(false);
      }
    }, // Helper methods
    canAccess(permission) {
      return this.isAuthenticated && this.hasPermission(permission);
    },

    isAdmin() {
      return this.userRole === "Admin";
    },

    isManager() {
      return this.userRole === "Management";
    },

    isInternship() {
      return this.userRole === "Internship";
    },

    isEmployee() {
      return this.userRole === "Employee";
    },

    // Role-based access control methods
    canAccessDashboard() {
      // Hanya Admin dan Management yang bisa akses dashboard
      return this.isAdmin() || this.isManager();
    },

    canAccessUserManagement() {
      // Hanya Admin yang bisa akses user management
      return this.isAdmin();
    },

    canAccessBookingManagement() {
      // Admin dan Management bisa akses booking management
      return this.isAdmin() || this.isManager();
    },

    canAccessAttendanceManagement() {
      // Admin dan Management bisa akses attendance management
      return this.isAdmin() || this.isManager();
    },
  });

  // Initialize store setelah Alpine dimulai
  document.addEventListener("alpine:init", () => {
    Alpine.store("auth").init();
  });

  console.log("Auth store initialized");
}

// Export untuk penggunaan sebagai module
export { initAuthStore };

// Untuk penggunaan global di browser
if (typeof window !== "undefined") {
  window.initAuthStore = initAuthStore;
}

// Auto-initialize
if (typeof Alpine !== "undefined") {
  initAuthStore();
} else {
  // Tunggu Alpine.js dimuat
  document.addEventListener("alpine:init", initAuthStore);
}
