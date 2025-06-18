/**
 * User Form Alpine.js Component
 * Handles both adding new users and editing existing users
 */

import {
  getUserById,
  updateUser,
  updateUserData,
  updateUserPhoto,
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
    isLoadingData: false,
    isSaving: false,
    isLoadingMasters: false,
    errorMessage: "",
    generalErrorMessage: "",

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
      confirmPassword: "",
      full_name: "",
      nip_nim: "",
      phone: "",
      description: "",
      id_roles: "",
      id_programs: "",
      id_position: "",
      id_divisions: "",
      latitude: "1.18546", // Default Jakarta coordinates
      longitude: "104.10202",
      radius: "100", // Default radius
    },

    // Master data options
    masterData: {
      roles: [],
      programs: [],
      positions: [],
      divisions: [],
    },

    // File handling
    facePhotoFile: null,
    photoPreview: null,
    currentPhotoUrl: "",
    validationErrors: {},

    // Warning alert state
    showProgramWarning: false,
    /**
     * Inisialisasi komponen
     */ async init() {
      console.log("Initializing user form component...");

      // Check if we're in edit mode
      const urlParams = new URLSearchParams(window.location.search);
      this.userId = urlParams.get("id");
      this.isEditMode = !!this.userId;

      // Update page title based on mode
      this.updatePageTitle();

      if (this.isEditMode) {
        this.isLoadingData = true;
        await this.loadUserDataAndMasters();
      } else {
        this.isLoadingData = false;
        await this.initMasters();
        this.initializeMap();
      }

      // Debug watcher for full_name
      this.$watch("formData.full_name", (value) => {
        console.log("Full name changed to:", value);
      });
    },

    /**
     * Load user data and masters for edit mode
     */
    async loadUserDataAndMasters() {
      try {
        this.isLoadingData = true;
        this.isLoadingMasters = true;
        this.errorMessage = "";

        console.log("Loading user data and masters for ID:", this.userId);

        // Load user data and master data concurrently
        const results = await Promise.allSettled([
          getUserById(this.userId),
          getRoles(),
          getPrograms(),
          getDivisions(),
          getPositions(), // Load all positions initially
        ]);

        // Handle user data result
        if (results[0].status === "fulfilled") {
          const userData = results[0].value;
          console.log("User data loaded:", userData); // Populate form with user data
          this.formData = {
            email: userData.email || "",
            password: "", // Don't populate password for security
            confirmPassword: "",
            full_name: userData.full_name || "",
            nip_nim: userData.nip_nim || "",
            phone: userData.phone || "",
            description: userData.description || "",
            id_roles: userData.id_roles ? String(userData.id_roles) : "",
            id_programs: userData.id_programs
              ? String(userData.id_programs)
              : "",
            id_position: userData.id_position
              ? String(userData.id_position)
              : "",
            id_divisions: userData.id_divisions
              ? String(userData.id_divisions)
              : "",
            latitude: userData.location?.latitude || "1.18546",
            longitude: userData.location?.longitude || "104.10202",
            radius: userData.location?.radius || "100",
          };

          // Set current photo URL if exists
          if (userData.photo) {
            this.currentPhotoUrl = `/${userData.photo}`;
          }
        } else {
          console.error("Failed to load user data:", results[0].reason);
          this.generalErrorMessage = "Gagal memuat data pengguna";
          window.showAlertModal({
            type: "error",
            title: "Gagal memuat data pengguna",
            message: results[0].reason.message,
          });
        }

        // Handle master data results
        if (results[1].status === "fulfilled") {
          this.masterData.roles = results[1].value;
        }
        if (results[2].status === "fulfilled") {
          this.masterData.programs = results[2].value;
        }
        if (results[3].status === "fulfilled") {
          this.masterData.divisions = results[3].value;
        }
        if (results[4].status === "fulfilled") {
          this.masterData.positions = results[4].value;
        } // After data is loaded, positions are already available
        // No need to filter positions as they are not program-specific in this API

        this.isLoadingData = false;
        this.isLoadingMasters = false;

        // Initialize map after data is loaded
        this.$nextTick(() => {
          this.initializeMap();
        });
      } catch (error) {
        console.error("Error loading user data and masters:", error);
        this.generalErrorMessage = "Gagal memuat data";
        this.isLoadingData = false;
        this.isLoadingMasters = false;
        window.showAlertModal({
          type: "error",
          title: "Gagal memuat data",
          message: error.message,
        });
      }
    } /**
     * Update page title based on mode
     */,
    updatePageTitle() {
      const titleElement = document.querySelector("title");

      if (this.isEditMode) {
        if (titleElement) {
          titleElement.textContent =
            "Edit User | InfiniteTrack - Tailwind CSS Admin Dashboard Template";
        }
      } else {
        if (titleElement) {
          titleElement.textContent =
            "Tambah User | InfiniteTrack - Tailwind CSS Admin Dashboard Template";
        }
      }
    } /**
     * Load master data for add mode (roles, programs, positions, divisions)
     */,
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

        this.masterData.roles = rolesData;
        this.masterData.programs = programsData;
        this.masterData.positions = positionsData;
        this.masterData.divisions = divisionsData;

        console.log("Master data loaded:", {
          roles: this.masterData.roles.length,
          programs: this.masterData.programs.length,
          positions: this.masterData.positions.length,
          divisions: this.masterData.divisions.length,
        });
      } catch (error) {
        console.error("Error loading master data:", error);
        this.errorMessage = "Gagal memuat data master";
        window.showAlertModal({
          type: "error",
          title: "Gagal memuat data master",
          message: error.message,
        });
      } finally {
        this.isLoadingMasters = false;
      }
    } /**
     * Handle position dropdown click
     */,
    handlePositionClick() {
      // No validation needed as positions are not program-dependent
      console.log("Position dropdown clicked");
    },

    /**
     * Hide program warning
     */
    hideProgramWarning() {
      this.showProgramWarning = false;
    } /**
     * Update positions based on selected program
     */,
    async updatePositionsForProgram(programId, keepCurrentPosition = false) {
      try {
        console.log("Program selected:", programId);
        // Since positions are not filtered by program in this API,
        // we just log the selection for debugging
        // No position reset needed as all positions are available
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
    } /**
     * Submit form (create or update user)
     */,
    async submitForm() {
      try {
        this.isSaving = true;

        // Validate form
        const validationErrors = this.validateForm();
        if (validationErrors.length > 0) {
          this.showErrorModal(validationErrors.join("\\n"));
          return;
        }

        console.log("Submitting user data...");

        let result;
        if (this.isEditMode) {
          // Edit mode: Use separate APIs for data and photo
          await this.updateExistingUser();
        } else {
          // Create mode: Use single API with FormData
          await this.createNewUser();
        }

        const successMessage = this.isEditMode
          ? "User berhasil diperbarui!"
          : "User berhasil ditambahkan!";
        this.showSuccessModal(successMessage, () => {
          this.cleanup();
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
    },

    /**
     * Create new user with FormData
     */
    async createNewUser() {
      const formData = new FormData();

      // User data fields
      const userData = {
        email: this.formData.email,
        password: this.formData.password,
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

      // Append user data to FormData
      Object.keys(userData).forEach((key) => {
        formData.append(key, userData[key]);
      });

      // Add photo (required for new user)
      formData.append("face_photo", this.facePhotoFile);

      console.log("Creating new user:", userData);
      const result = await createUser(formData);
      console.log("User created successfully:", result);
    },

    /**
     * Update existing user with separate API calls
     */
    async updateExistingUser() {
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

      // Add password only if provided
      if (this.formData.password.trim()) {
        userData.password = this.formData.password;
      }

      console.log("Updating user data:", userData);

      // Update user data
      const userResult = await updateUserData(this.userId, userData);
      console.log("User data updated successfully:", userResult);

      // Update photo if a new one is selected
      if (this.facePhotoFile) {
        console.log("Updating user photo...");
        const photoResult = await updateUserPhoto(
          this.userId,
          this.facePhotoFile,
        );
        console.log("User photo updated successfully:", photoResult);
      }
    },

    /**
     * Validate form data
     */
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
      } // Password validation
      if (!this.isEditMode) {
        // For new users, password is required
        if (!this.formData.password.trim()) {
          errors.push("Password harus diisi untuk user baru");
        }
        // Confirm password check for new users
        if (this.formData.password !== this.formData.confirmPassword) {
          errors.push("Konfirmasi password tidak cocok");
        }
        // Photo required for new user
        if (!this.facePhotoFile) {
          errors.push("Foto profil harus diupload untuk user baru");
        }
      } else {
        // For existing users, password is optional
        // But if provided, it should meet requirements
        if (
          this.formData.password.trim() &&
          this.formData.password.length < 6
        ) {
          errors.push("Password minimal 6 karakter");
        }

        // Check confirm password if password is provided
        if (
          this.formData.password.trim() &&
          this.formData.password !== this.formData.confirmPassword
        ) {
          errors.push("Konfirmasi password tidak cocok");
        }
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
    } /**
     * Cancel form and redirect
     */,
    cancelForm() {
      if (
        confirm(
          "Apakah Anda yakin ingin membatalkan? Data yang belum disimpan akan hilang.",
        )
      ) {
        this.cleanup();
        window.location.href = "/management-user.html";
      }
    },

    /**
     * Cleanup resources before navigation
     */
    cleanup() {
      if (this.mapPickerInstance) {
        this.mapPickerInstance.destroy();
        this.mapPickerInstance = null;
      }
      this.mapInitialized = false;
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
    } /**
     * Initialize map picker
     */,
    initializeMap() {
      try {
        console.log("Initializing map picker...");

        // Destroy existing map instance if it exists
        if (this.mapPickerInstance) {
          this.mapPickerInstance.destroy();
          this.mapPickerInstance = null;
        }

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
