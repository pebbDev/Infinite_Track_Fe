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
import MapPicker from "../../components/mapPicker.js";

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

    // Map related state
    mapPickerInstance: null,
    mapInitialized: false,
    mapSearchQuery: "",
    searchResults: [],
    isSearchingLocation: false,

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
      radius: "100", // Default radius
    },

    // Master data options
    roles: [],
    programs: [],
    positions: [],
    divisions: [],

    // File handling
    facePhotoFile: null,
    photoPreview: null,
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
      } // Initialize map after DOM is ready
      this.$nextTick(() => {
        this.initializeMap();
      });

      // Debug watcher for full_name
      this.$watch("formData.full_name", (value) => {
        console.log("Full name changed to:", value);
      });
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
          radius: userData.radius || "100",
        };

        console.log("User data loaded:", this.formData);
      } catch (error) {
        console.error("Error loading user data:", error);
        this.errorMessage = "Gagal memuat data pengguna";
        this.showErrorModal("Gagal memuat data pengguna");
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Load master data (roles, programs, positions, divisions)
     */
    async initMasters() {
      try {
        this.isLoadingMasters = true;
        console.log("Loading master data...");

        // Load all master data concurrently
        const [rolesData, programsData, positionsData, divisionsData] =
          await Promise.all([
            getRoles(),
            getPrograms(),
            getPositions(),
            getDivisions(),
          ]);

        this.roles = rolesData;
        this.programs = programsData;
        this.positions = positionsData;
        this.divisions = divisionsData;

        console.log("Master data loaded:", {
          roles: this.roles.length,
          programs: this.programs.length,
          positions: this.positions.length,
          divisions: this.divisions.length,
        });
      } catch (error) {
        console.error("Error loading master data:", error);
        this.errorMessage = "Gagal memuat data master";
      } finally {
        this.isLoadingMasters = false;
      }
    },

    /**
     * Handle position dropdown click
     */
    handlePositionClick() {
      if (!this.formData.id_programs) {
        this.showProgramWarning = true;
        setTimeout(() => {
          this.showProgramWarning = false;
        }, 3000);
      }
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

        // Reset position if program changed
        this.formData.id_position = "";

        if (programId && this.positions.length > 0) {
          const isValidPosition = this.positions.some(
            (pos) =>
              pos.id_programs === parseInt(programId) &&
              pos.id === parseInt(this.formData.id_position),
          );

          if (!isValidPosition) {
            this.formData.id_position = "";
          }
        }
      } catch (error) {
        console.error("Error updating positions:", error);
      }
    },

    /**
     * Handle file input change
     */
    handleFileChange(event) {
      const file = event.target.files[0];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!file) return;

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert("Hanya file gambar (PNG, JPEG, JPG) yang diperbolehkan!");
        event.target.value = "";
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        alert("Ukuran file maksimal 2MB!");
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
    },

    /**
     * Submit form (create or update user)
     */
    async submitForm() {
      try {
        this.isSaving = true;

        // Validate form
        const validationErrors = this.validateForm();
        if (validationErrors.length > 0) {
          this.showErrorModal(validationErrors.join("\\n"));
          return;
        }

        // Prepare form data
        const formData = new FormData();

        // User data fields
        const userData = {
          email: this.formData.email,
          full_name: this.formData.full_name,
          nip_nim: this.formData.nip_nim,
          phone: this.formData.phone,
          description: this.formData.description,
          id_roles: parseInt(this.formData.id_roles),
          id_programs: parseInt(this.formData.id_programs),
          id_position: parseInt(this.formData.id_position),
          id_divisions: parseInt(this.formData.id_divisions),
          latitude: this.formData.latitude,
          longitude: this.formData.longitude,
          radius: this.formData.radius,
        };

        // Add password only if provided (for create or update)
        if (this.formData.password) {
          userData.password = this.formData.password;
        }

        // Append user data to FormData
        Object.keys(userData).forEach((key) => {
          formData.append(key, userData[key]);
        });

        // Add photo if selected
        if (this.facePhotoFile) {
          formData.append("face_photo", this.facePhotoFile);
        }

        console.log("Submitting user data:", userData);

        let result;
        if (this.isEditMode) {
          result = await updateUser(this.userId, formData);
        } else {
          result = await createUser(formData);
        }

        console.log("User saved successfully:", result);

        const successMessage = this.isEditMode
          ? "User berhasil diperbarui!"
          : "User berhasil ditambahkan!";

        this.showSuccessModal(successMessage, () => {
          window.location.href = "/management-user.html";
        });
      } catch (error) {
        console.error("Error saving user:", error);
        const errorMessage =
          error.message || "Terjadi kesalahan saat menyimpan data user";
        this.showErrorModal(errorMessage);
      } finally {
        this.isSaving = false;
      }
    } /**
     * Validate form data
     */,
    validateForm() {
      const errors = [];

      // Debug logging
      console.log("Validating form data:", this.formData);

      if (!this.formData.email.trim()) {
        errors.push("Email harus diisi");
      }

      if (!this.formData.full_name.trim()) {
        console.log(
          "Full name validation failed. Value:",
          this.formData.full_name,
        );
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

      // Password required for new user
      if (!this.isEditMode && !this.formData.password.trim()) {
        errors.push("Password harus diisi untuk user baru");
      }

      // Photo required for new user
      if (!this.isEditMode && !this.facePhotoFile) {
        errors.push("Foto profil harus diupload untuk user baru");
      }

      return errors;
    },

    /**
     * Reset form to initial state
     */
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
        radius: "100",
      };

      this.facePhotoFile = null;
      this.photoPreview = null;
      this.validationErrors = {}; // Reset map
      if (this.mapPickerInstance) {
        this.mapPickerInstance.setPosition(1.18546, 104.10201, 100);
      }
    },

    /**
     * Cancel form and redirect
     */
    cancelForm() {
      if (
        confirm(
          "Apakah Anda yakin ingin membatalkan? Data yang belum disimpan akan hilang.",
        )
      ) {
        window.location.href = "/management-user.html";
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

    /**
     * Initialize map picker
     */
    initializeMap() {
      try {
        console.log("Initializing map picker...");

        // Create map picker instance
        this.mapPickerInstance = new MapPicker("mapContainer", {
          center:
            this.formData.latitude && this.formData.longitude
              ? [
                  parseFloat(this.formData.latitude),
                  parseFloat(this.formData.longitude),
                ]
              : [1.18546, 104.10201], // Default location
          zoom: 13,
          radius: parseFloat(this.formData.radius) || 100,
          onMapUpdate: (data) => this.onMapUpdate(data),
        });

        // Initialize the map
        this.mapPickerInstance.init();
        this.mapInitialized = true;

        // Set initial position if we have coordinates
        if (this.formData.latitude && this.formData.longitude) {
          this.mapPickerInstance.setPosition(
            this.formData.latitude,
            this.formData.longitude,
            this.formData.radius,
          );
        }

        console.log("Map picker initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
        this.mapInitialized = false;
      }
    },

    /**
     * Handle map updates
     */
    onMapUpdate(data) {
      console.log("Map updated:", data);

      // Update form data with new coordinates
      this.formData.latitude = data.latitude;
      this.formData.longitude = data.longitude;
      this.formData.radius = data.radius.toString();

      // Update description if provided
      if (data.description) {
        this.formData.description = data.description;
      }
    },

    /**
     * Update map radius when input changes
     */
    updateMapRadius() {
      if (this.mapPickerInstance && this.formData.radius) {
        const radius = parseFloat(this.formData.radius);
        if (!isNaN(radius) && radius > 0) {
          this.mapPickerInstance.updateRadius(radius);
        }
      }
    },

    /**
     * Search for location
     */
    async searchLocation() {
      if (!this.mapSearchQuery || this.mapSearchQuery.trim().length < 3) {
        return;
      }

      try {
        this.isSearchingLocation = true;
        this.searchResults = [];

        console.log("Searching for location:", this.mapSearchQuery);

        if (this.mapPickerInstance) {
          const results = await this.mapPickerInstance.searchLocation(
            this.mapSearchQuery,
          );
          this.searchResults = results.slice(0, 5); // Limit to 5 results
          console.log("Search results:", this.searchResults);
        }
      } catch (error) {
        console.error("Location search error:", error);
        this.showErrorModal("Gagal mencari lokasi. Silakan coba lagi.");
      } finally {
        this.isSearchingLocation = false;
      }
    },

    /**
     * Select search result
     */
    selectSearchResult(result) {
      console.log("Selected location:", result);

      // Update map position
      if (this.mapPickerInstance) {
        this.mapPickerInstance.setPosition(
          result.lat,
          result.lon,
          this.formData.radius,
        );
      }

      // Update form data
      this.formData.latitude = result.lat.toFixed(6);
      this.formData.longitude = result.lon.toFixed(6);
      this.formData.description = result.display_name;

      // Clear search
      this.mapSearchQuery = "";
      this.searchResults = [];
    },
  };
}

// Export function
export { userFormAlpineData };
