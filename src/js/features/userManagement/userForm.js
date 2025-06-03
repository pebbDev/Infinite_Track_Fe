/**
 * User Form Alpine.js Component
 * Handles both adding new users and editing existing users
 */

import {
  getUserById,
  updateUser,
  createUser,
  getRoles,
  getPrograms,
  getPositions,
  getDivisions,
} from "../../services/userService.js";

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
    isLoadingMasters: false,
    errorMessage: "",

    // Form data - sesuai dengan API structure
    formData: {
      email: "",
      password: "",
      full_name: "",
      nip_nim: "",
      phone: "",
      description: "",
      id_roles: "",
      id_programs: "",
      id_position: "",
      id_divisions: "",
      latitude: "",
      longitude: "",
      radius: "",
    },

    // Master data options
    roles: [],
    programs: [],
    positions: [],
    divisions: [],

    // File handling
    facePhotoFile: null,
    photoPreview: null, // Validation errors
    validationErrors: {},

    // Warning alert state
    showProgramWarning: false,

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

      // Load master data first
      await this.initMasters();

      // Load form data if in edit mode
      if (this.isEditMode) {
        await this.loadUserData();
      }
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
    } /**
     * Load user data for editing
     */,
    async loadUserData() {
      try {
        this.isLoading = true;
        this.errorMessage = "";

        console.log("Loading user data for ID:", this.userId);

        const userData = await getUserById(this.userId);

        // Populate form with user data sesuai struktur API
        this.formData = {
          email: userData.email || "",
          password: "", // Don't populate password for security
          full_name: userData.full_name || "",
          nip_nim: userData.nip_nim || "",
          phone: userData.phone || "",
          description: userData.description || "",
          id_roles: userData.id_roles || "",
          id_programs: userData.id_programs || "",
          id_position: userData.id_position || "",
          id_divisions: userData.id_divisions || "",
          latitude: userData.latitude || "",
          longitude: userData.longitude || "",
          radius: userData.radius || "",
        };

        // Update positions based on selected program
        if (this.formData.id_programs) {
          await this.updatePositionsForProgram(this.formData.id_programs);
        }

        console.log("User data loaded successfully:", this.formData);
      } catch (error) {
        console.error("Error loading user data:", error);
        this.errorMessage = error.message;
        this.showErrorModal(error.message);
      } finally {
        this.isLoading = false;
      }
    } /**
     * Initialize master data (roles, programs, divisions)
     */,
    async initMasters() {
      try {
        this.isLoadingMasters = true;
        console.log("Loading master data...");

        // Load master data in parallel
        const [rolesData, programsData, divisionsData] = await Promise.all([
          getRoles(),
          getPrograms(),
          getDivisions(),
        ]);

        this.roles = rolesData;
        this.programs = programsData;
        this.divisions = divisionsData;

        console.log("Master data loaded successfully:", {
          roles: this.roles.length,
          programs: this.programs.length,
          divisions: this.divisions.length,
        });
      } catch (error) {
        console.error("Error loading master data:", error);
        this.showErrorModal("Gagal memuat data master: " + error.message);
      } finally {
        this.isLoadingMasters = false;
      }
    } /**
     * Handle position dropdown interaction - show warning if no program selected
     */,
    handlePositionClick() {
      if (!this.formData.id_programs) {
        this.showProgramWarning = true;
        // Auto hide warning after 5 seconds
        setTimeout(() => {
          this.showProgramWarning = false;
        }, 5000);
        return false;
      }
      return true;
    },

    /**
     * Hide program warning
     */
    hideProgramWarning() {
      this.showProgramWarning = false;
    },

    /**
     * Update positions based on selected program
     */
    async updatePositionsForProgram(programId) {
      try {
        console.log("Loading positions for program:", programId);
        this.positions = await getPositions(programId);

        // Reset position selection if current position is not valid for new program
        if (this.formData.id_position) {
          const isValidPosition = this.positions.some(
            (pos) => pos.id == this.formData.id_position,
          );
          if (!isValidPosition) {
            this.formData.id_position = "";
          }
        }

        console.log("Positions updated:", this.positions.length);
      } catch (error) {
        console.error("Error loading positions:", error);
        this.positions = [];
        this.formData.id_position = "";
      }
    },

    /**
     * Handle file change for photo upload
     */
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        this.facePhotoFile = null;
        this.photoPreview = null;
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        this.showErrorModal(
          "Format file tidak valid. Gunakan format JPEG, JPG, atau PNG.",
        );
        event.target.value = "";
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.showErrorModal("Ukuran file terlalu besar. Maksimal 2MB.");
        event.target.value = "";
        return;
      }

      this.facePhotoFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } /**
     * Handle form submission
     */,
    async submitForm() {
      try {
        this.isSaving = true;
        this.errorMessage = "";
        this.validationErrors = {};

        // Validate form
        if (!this.validateForm()) {
          return;
        }

        // Prepare data for API sesuai struktur yang dibutuhkan
        const submitData = {
          email: this.formData.email,
          full_name: this.formData.full_name,
          nip_nim: this.formData.nip_nim,
          phone: this.formData.phone,
          description: this.formData.description,
          id_roles: parseInt(this.formData.id_roles),
          id_programs: parseInt(this.formData.id_programs),
          id_position: parseInt(this.formData.id_position),
          id_divisions: parseInt(this.formData.id_divisions),
          latitude: this.formData.latitude || "",
          longitude: this.formData.longitude || "",
          radius: this.formData.radius || "",
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
          console.log("Creating new user:", submitData);
          result = await createUser(submitData, this.facePhotoFile);
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
    } /**
     * Validate form data
     */,
    validateForm() {
      const errors = [];

      // Required fields validation
      if (!this.formData.email.trim()) {
        errors.push("Email harus diisi");
      }
      if (!this.formData.full_name.trim()) {
        errors.push("Nama lengkap harus diisi");
      }
      if (!this.formData.nip_nim.trim()) {
        errors.push("NIP/NIM harus diisi");
      }
      if (!this.formData.phone.trim()) {
        errors.push("Nomor telepon harus diisi");
      }
      if (!this.formData.id_roles) {
        errors.push("Role harus dipilih");
      }
      if (!this.formData.id_programs) {
        errors.push("Program harus dipilih");
      }
      if (!this.formData.id_position) {
        errors.push("Position harus dipilih");
      }
      if (!this.formData.id_divisions) {
        errors.push("Division harus dipilih");
      }

      // Password validation (only required for new users)
      if (!this.isEditMode && !this.formData.password.trim()) {
        errors.push("Password harus diisi untuk pengguna baru");
      }

      // Photo validation (only required for new users)
      if (!this.isEditMode && !this.facePhotoFile) {
        errors.push("Foto profil harus diupload untuk pengguna baru");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.formData.email && !emailRegex.test(this.formData.email)) {
        errors.push("Format email tidak valid");
      }

      // Phone number validation (Indonesian format)
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
      if (
        this.formData.phone &&
        !phoneRegex.test(this.formData.phone.replace(/\s/g, ""))
      ) {
        errors.push(
          "Format nomor telepon tidak valid (gunakan format Indonesia)",
        );
      }

      if (errors.length > 0) {
        this.showErrorModal(
          "Mohon perbaiki kesalahan berikut:\n• " + errors.join("\n• "),
        );
        return false;
      }

      return true;
    } /**
     * Reset form
     */,
    resetForm() {
      this.formData = {
        email: "",
        password: "",
        full_name: "",
        nip_nim: "",
        phone: "",
        description: "",
        id_roles: "",
        id_programs: "",
        id_position: "",
        id_divisions: "",
        latitude: "",
        longitude: "",
        radius: "",
      };
      this.facePhotoFile = null;
      this.photoPreview = null;
      this.validationErrors = {};
      this.errorMessage = "";

      // Reset file input
      const fileInput = document.getElementById("photo-input");
      if (fileInput) {
        fileInput.value = "";
      }
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
