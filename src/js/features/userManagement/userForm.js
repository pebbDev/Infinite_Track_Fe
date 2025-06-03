/**
 * User Form Alpine.js Component
 * Handles both adding new users and editing existing users
 */

import { getUserById, updateUser } from "../../services/userService.js";

/**
 * Data dan metode Alpine.js untuk komponen form pengguna
 * @returns {Object} - Objek yang berisi state dan metode Alpine.js
 */
function userFormAlpineData() {
  return {
    // Form state
    isEditMode: false,
    userId: null,
    isLoading: false,
    isSaving: false,
    errorMessage: "",

    // Form data
    formData: {
      email: "",
      password: "",
      fullName: "",
      nipNim: "",
      phoneNumber: "",
      address: "",
      roleId: "",
      positionId: "",
    },

    // Available options (will be loaded from API)
    roles: [],
    positions: [],

    /**
     * Inisialisasi komponen
     */
    async init() {
      console.log("Initializing user form component...");

      // Check if we're in edit mode
      const urlParams = new URLSearchParams(window.location.search);
      this.userId = urlParams.get("id");
      this.isEditMode = !!this.userId;

      // Update page title and form behavior based on mode
      this.updatePageTitle();

      // Load form data if in edit mode
      if (this.isEditMode) {
        await this.loadUserData();
      }

      // Load dropdown options (roles and positions)
      await this.loadFormOptions();
    },

    /**
     * Update page title based on mode
     */
    updatePageTitle() {
      const titleElement = document.querySelector("title");
      const breadcrumbElement = document.querySelector('[x-data*="pageName"]');

      if (this.isEditMode) {
        if (titleElement) {
          titleElement.textContent =
            "Edit User | InfiniteTrack - Tailwind CSS Admin Dashboard Template";
        }
        if (breadcrumbElement) {
          breadcrumbElement.setAttribute("x-data", "{ pageName: `Edit User` }");
        }
      } else {
        if (titleElement) {
          titleElement.textContent =
            "Tambah User | InfiniteTrack - Tailwind CSS Admin Dashboard Template";
        }
        if (breadcrumbElement) {
          breadcrumbElement.setAttribute(
            "x-data",
            "{ pageName: `Tambah User` }",
          );
        }
      }
    },

    /**
     * Load user data for editing
     */
    async loadUserData() {
      try {
        this.isLoading = true;
        this.errorMessage = "";

        console.log("Loading user data for ID:", this.userId);

        const userData = await getUserById(this.userId);

        // Populate form with user data
        this.formData = {
          email: userData.email || "",
          password: "", // Don't populate password for security
          fullName: userData.full_name || userData.fullName || "",
          nipNim: userData.nip_nim || userData.nipNim || "",
          phoneNumber: userData.phone || userData.phoneNumber || "",
          address: userData.address || "",
          roleId: userData.role_id || userData.roleId || "",
          positionId: userData.position_id || userData.positionId || "",
        };

        console.log("User data loaded successfully:", this.formData);
      } catch (error) {
        console.error("Error loading user data:", error);
        this.errorMessage = error.message;
        this.showErrorModal(error.message);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load form options (roles and positions)
     */
    async loadFormOptions() {
      try {
        // For now, use static options. In real implementation, these would come from API
        this.roles = [
          { id: 1, name: "Admin" },
          { id: 2, name: "Manager" },
          { id: 3, name: "Staff" },
          { id: 4, name: "User" },
        ];

        this.positions = [
          { id: 1, name: "IT Manager" },
          { id: 2, name: "Software Developer" },
          { id: 3, name: "System Administrator" },
          { id: 4, name: "Business Analyst" },
          { id: 5, name: "Project Manager" },
        ];

        console.log("Form options loaded");
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    },

    /**
     * Handle form submission
     */
    async submitForm() {
      try {
        this.isSaving = true;
        this.errorMessage = "";

        // Validate form
        if (!this.validateForm()) {
          return;
        }

        // Prepare data for API
        const submitData = {
          email: this.formData.email,
          full_name: this.formData.fullName,
          nip_nim: this.formData.nipNim,
          phone: this.formData.phoneNumber,
          address: this.formData.address,
          role_id: parseInt(this.formData.roleId),
          position_id: parseInt(this.formData.positionId),
        };

        // Add password only if provided (for both create and update)
        if (this.formData.password.trim()) {
          submitData.password = this.formData.password;
        }

        let result;
        if (this.isEditMode) {
          console.log("Updating user:", this.userId, submitData);
          result = await updateUser(this.userId, submitData);
          this.showSuccessModal("Pengguna berhasil diperbarui!", () => {
            window.location.href = "management-user.html";
          });
        } else {
          // TODO: Implement createUser function
          console.log("Creating new user:", submitData);
          this.showSuccessModal("Pengguna berhasil ditambahkan!", () => {
            window.location.href = "management-user.html";
          });
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        this.errorMessage = error.message;
        this.showErrorModal(error.message);
      } finally {
        this.isSaving = false;
      }
    },

    /**
     * Validate form data
     */
    validateForm() {
      const errors = [];

      // Required fields validation
      if (!this.formData.email.trim()) {
        errors.push("Email harus diisi");
      }
      if (!this.formData.fullName.trim()) {
        errors.push("Nama lengkap harus diisi");
      }
      if (!this.formData.nipNim.trim()) {
        errors.push("NIP/NIM harus diisi");
      }
      if (!this.formData.roleId) {
        errors.push("Role harus dipilih");
      }
      if (!this.formData.positionId) {
        errors.push("Position harus dipilih");
      }

      // Password validation (only required for new users)
      if (!this.isEditMode && !this.formData.password.trim()) {
        errors.push("Password harus diisi untuk pengguna baru");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.formData.email && !emailRegex.test(this.formData.email)) {
        errors.push("Format email tidak valid");
      }

      if (errors.length > 0) {
        this.showErrorModal(
          "Mohon perbaiki kesalahan berikut:\n• " + errors.join("\n• "),
        );
        return false;
      }

      return true;
    },

    /**
     * Reset form
     */
    resetForm() {
      this.formData = {
        email: "",
        password: "",
        fullName: "",
        nipNim: "",
        phoneNumber: "",
        address: "",
        roleId: "",
        positionId: "",
      };
      this.errorMessage = "";
    },

    /**
     * Cancel and go back to user list
     */
    cancelForm() {
      if (
        confirm(
          "Apakah Anda yakin ingin membatalkan? Semua perubahan akan hilang.",
        )
      ) {
        window.location.href = "management-user.html";
      }
    },

    /**
     * Show success modal
     */
    showSuccessModal(message, onOk = null) {
      if (typeof window.showAlertModal === "function") {
        window.showAlertModal({
          type: "success",
          title: "Berhasil",
          message: message,
          buttonText: "OK",
          showClose: true,
          onOk:
            onOk ||
            (() => {
              console.log("Success modal closed");
            }),
        });
      } else {
        // Fallback
        alert(message);
        if (onOk) onOk();
      }
    },

    /**
     * Show error modal
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
        // Fallback
        alert(message);
      }
    },
  };
}

// Export function
export { userFormAlpineData };
