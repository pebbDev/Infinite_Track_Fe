import "flatpickr/dist/flatpickr.min.css";
import "dropzone/dist/dropzone.css";
import "../css/style.css";

import Alpine from "alpinejs";
import persist from "@alpinejs/persist";
import flatpickr from "flatpickr";
import Dropzone from "dropzone";

import map01 from "./components/map-01";
import "./components/calendar-init.js";
import "./components/image-resize";
import "./components/modal/modalAlert.js";
import "./components/modal/deleteModal.js";
import "./components/logoutComponent.js";
import "./utils/storageManager.js";
import "./services/authService.js";
import "./services/userService.js";
import "./features/signinHandler.js";
import "./features/userManagement/userList.js";
import "./stores/authStore.js";
import "./utils/authGuard.js";
import "./utils/roleBasedAccess.js";

// Import authentication utilities
import { isAuthenticated, getCurrentUser } from "./services/authService.js";
import { getUserFromStorage } from "./utils/storageManager.js";
import { initAuthStore } from "./stores/authStore.js";
import { initRoleBasedAccess } from "./utils/roleBasedAccess.js";
import { userListAlpineData } from "./features/userManagement/userListSimple.js";
import { userFormAlpineData } from "./features/userManagement/userForm.js";

Alpine.plugin(persist);
window.Alpine = Alpine;

// Expose Alpine.js components to window for use in HTML
window.userListAlpineData = userListAlpineData;
window.userFormAlpineData = userFormAlpineData;

// Initialize authentication session checking
function initializeAuthSession() {
  console.log("Initializing authentication session...");

  // Check if user is on a protected page
  const currentPath = window.location.pathname;
  const protectedPages = [
    "/index.html",
    "/management-user.html",
    "/management-booking.html",
    "/management-attendance.html",
    "/profile.html",
    "/calendar.html",
    "/form-user.html",
  ];

  // Get page name from path
  const pageName = currentPath.split("/").pop() || "index.html";
  const isProtectedPage =
    protectedPages.some((page) => page.includes(pageName)) ||
    currentPath === "/";

  // If on protected page, check authentication
  if (isProtectedPage) {
    console.log("On protected page, checking authentication...");

    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to signin...");

      // Save current URL for redirect after login
      sessionStorage.setItem("redirectAfterLogin", window.location.href);

      // Redirect to signin page
      window.location.href = "/signin.html";
      return;
    }

    // User is authenticated, validate session
    validateUserSession();
  }

  // If on signin page and user is already authenticated, redirect to dashboard
  if (pageName === "signin.html" && isAuthenticated()) {
    console.log("User already authenticated, redirecting to dashboard...");
    window.location.href = "/index.html";
    return;
  }
}

// Validate user session and sync with Alpine store
async function validateUserSession() {
  try {
    console.log("Validating user session...");

    // Get user data from storage
    const storedUser = getUserFromStorage();

    if (storedUser) {
      console.log("User data found in storage:", storedUser);

      // Try to validate with server
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("Session validated with server");

          // Update Alpine store if available
          if (
            typeof Alpine !== "undefined" &&
            Alpine.store &&
            Alpine.store("auth")
          ) {
            Alpine.store("auth").setUser(currentUser);
          }
        } else {
          throw new Error("Invalid session");
        }
      } catch (error) {
        console.warn(
          "Session validation failed, using stored data:",
          error.message,
        );

        // Use stored data if server validation fails
        if (
          typeof Alpine !== "undefined" &&
          Alpine.store &&
          Alpine.store("auth")
        ) {
          Alpine.store("auth").setUser(storedUser);
        }
      }
    } else {
      console.log("No user data in storage");

      // Clear authentication and redirect to signin
      if (
        typeof Alpine !== "undefined" &&
        Alpine.store &&
        Alpine.store("auth")
      ) {
        Alpine.store("auth").clearAuth();
      }

      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = "/signin.html";
    }
  } catch (error) {
    console.error("Error validating session:", error);

    // Clear authentication on error
    if (typeof Alpine !== "undefined" && Alpine.store && Alpine.store("auth")) {
      Alpine.store("auth").clearAuth();
    }

    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "/signin.html";
  }
}

// Initialize Alpine.js with authentication
Alpine.start();

// Initialize authentication after Alpine.js is ready
document.addEventListener("alpine:init", () => {
  console.log("Alpine.js initialized, setting up authentication...");

  // Initialize auth store
  initAuthStore();

  // Initialize session checking
  initializeAuthSession();
});

// Fallback initialization if Alpine is already started
setTimeout(() => {
  if (typeof Alpine !== "undefined") {
    initializeAuthSession();
  }
}, 100);

// Function to show coordinates placeholder
function showCoordinatesPlaceholder(latitude, longitude, mapElementId) {
  const mapElement = document.getElementById(mapElementId);
  if (!mapElement) {
    console.error("Map container not found:", mapElementId);
    return;
  }

  // Clear previous content
  mapElement.innerHTML = "";

  if (latitude && longitude) {
    // Show coordinates info with location icon
    mapElement.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-4 text-center bg-blue-50 dark:bg-blue-900/20 rounded">
        <svg class="w-12 h-12 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <p class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Lokasi Booking</p>
        <p class="text-xs text-blue-600 dark:text-blue-400">Latitude: ${latitude}</p>
        <p class="text-xs text-blue-600 dark:text-blue-400">Longitude: ${longitude}</p>
      </div>
    `;
  } else {
    // Show no coordinates message
    mapElement.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-4 text-center">
        <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">Data koordinat tidak tersedia</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Tidak dapat menampilkan lokasi</p>
      </div>
    `;
  }
}

// Make function globally available
window.showCoordinatesPlaceholder = showCoordinatesPlaceholder;

// Initialize delete confirmation functionality
document.addEventListener("DOMContentLoaded", function () {
  // Select all delete buttons
  const deleteButtons = document.querySelectorAll(".js-delete-item-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Get data attributes
      const itemId = this.getAttribute("data-item-id");
      const itemName = this.getAttribute("data-item-name");

      // Show danger modal alert for deletion confirmation
      window.showAlertModal({
        type: "danger",
        title: "Konfirmasi Hapus",
        message: `Apakah Anda yakin ingin menghapus data karyawan "${itemName}" (${itemId})? Tindakan ini tidak dapat dibatalkan.`,
        buttonText: "Ya, Hapus",
        showClose: true,
        onOk: function () {
          // Handle deletion logic here
          console.log(`Menghapus karyawan: ${itemName} (${itemId})`);

          setTimeout(() => {
            window.showAlertModal({
              type: "success",
              title: "Berhasil Dihapus",
              message: `Data karyawan "${itemName}" telah berhasil dihapus dari sistem.`,
              buttonText: "OK",
              showClose: false,
            });
          }, 300);
        },
        onClose: function () {
          console.log("Penghapusan dibatalkan");
        },
      });
    });
  });
});

// Initialize user table modal functionality
document.addEventListener("DOMContentLoaded", function () {
  // Success buttons (green checkmark/approve)
  const successButtons = document.querySelectorAll(".js-success-btn");
  successButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const userId = this.getAttribute("data-user-id");
      const userName = this.getAttribute("data-user-name");

      window.showAlertModal({
        type: "success",
        title: "Konfirmasi Persetujuan Booking",
        message: `Apakah Anda yakin ingin menyetujui booking dari "${userName}" (${userId})?`,
        buttonText: "Ya, Setujui",
        showClose: true,
        onOk: function () {
          console.log(`Menyetujui booking: ${userName} (${userId})`);

          setTimeout(() => {
            window.showAlertModal({
              type: "success",
              title: "Booking Disetujui",
              message: `Booking dari "${userName}" telah berhasil disetujui.`,
              buttonText: "OK",
              showClose: false,
            });
          }, 300);
        },
        onClose: function () {
          console.log("Persetujuan booking dibatalkan");
        },
      });
    });
  });

  // Info buttons (blue eye icon/view details)
  const infoButtons = document.querySelectorAll(".js-info-btn");
  infoButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Extract all data attributes
      const userId = this.getAttribute("data-user-id");
      const userName = this.getAttribute("data-user-name");
      const role = this.getAttribute("data-role");
      const position = this.getAttribute("data-position");
      const schedule = this.getAttribute("data-schedule");
      const notes = this.getAttribute("data-notes");
      const koordinat = this.getAttribute("data-koordinat");
      const latitude = this.getAttribute("data-latitude");
      const longitude = this.getAttribute("data-longitude");

      // Find the body element and update its Alpine.js data
      const bodyElement = document.body;
      if (bodyElement._x_dataStack && bodyElement._x_dataStack[0]) {
        // Update the booking detail data
        bodyElement._x_dataStack[0].bookingDetailData = {
          userId: userId || "",
          fullName: userName || "", // Change namaLengkap to fullName
          role: role || "",
          position: position || "",
          jadwalBooking: schedule || "",
          notes: notes || "",
          koordinat: koordinat || "",
          latitude: latitude || "",
          longitude: longitude || "",
        };
        // Open the modal
        bodyElement._x_dataStack[0].isBookingDetailModalOpen = true;

        // Show coordinates placeholder after modal is shown
        setTimeout(() => {
          showCoordinatesPlaceholder(
            latitude,
            longitude,
            "booking-detail-map-container",
          );
        }, 100);
      }

      console.log(`Opening booking detail modal for: ${userName} (${userId})`);
    });
  });

  // Danger buttons (red X icon/delete) - Using new Delete Modal
  const dangerButtons = document.querySelectorAll(".js-danger-btn");
  dangerButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const userId = this.getAttribute("data-user-id");
      const userName = this.getAttribute("data-user-name");

      // Use the new delete modal instead of alert modal
      window.showDeleteModal({
        title: "Konfirmasi Hapus Booking",
        message: `Apakah Anda yakin ingin menghapus booking dari "${userName}" (${userId})? Tindakan ini tidak dapat dibatalkan.`,
        onConfirm: function (data) {
          console.log(`Menghapus booking: ${data.userName} (${data.userId})`);

          // Show success notification using alert modal
          setTimeout(() => {
            window.showAlertModal({
              type: "success",
              title: "Booking Dihapus",
              message: `Booking dari "${data.userName}" telah berhasil dihapus dari sistem.`,
              buttonText: "OK",
              showClose: false,
            });
          }, 300);
        },
        data: { userId, userName },
      });
    });
  });
});

// Init flatpickr
flatpickr(".datepicker", {
  mode: "range",
  static: true,
  monthSelectorType: "static",
  dateFormat: "M j, Y",
  defaultDate: [new Date().setDate(new Date().getDate() - 6), new Date()],
  prevArrow:
    '<svg class="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.25 6L9 12.25L15.25 18.5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  nextArrow:
    '<svg class="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 19L15 12.75L8.75 6.5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  onReady: (selectedDates, dateStr, instance) => {
    // eslint-disable-next-line no-param-reassign
    instance.element.value = dateStr.replace("to", "-");
    const customClass = instance.element.getAttribute("data-class");
    instance.calendarContainer.classList.add(customClass);
  },
  onChange: (selectedDates, dateStr, instance) => {
    // eslint-disable-next-line no-param-reassign
    instance.element.value = dateStr.replace("to", "-");
  },
});

// Init Dropzone
const dropzoneArea = document.querySelectorAll("#demo-upload");

if (dropzoneArea.length) {
  let myDropzone = new Dropzone("#demo-upload", { url: "/file/post" });
}

// Document Loaded
document.addEventListener("DOMContentLoaded", () => {
  map01();
});

// Get the current year
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// For Copy//
document.addEventListener("DOMContentLoaded", () => {
  const copyInput = document.getElementById("copy-input");
  if (copyInput) {
    // Select the copy button and input field
    const copyButton = document.getElementById("copy-button");
    const copyText = document.getElementById("copy-text");
    const websiteInput = document.getElementById("website-input");

    // Event listener for the copy button
    copyButton.addEventListener("click", () => {
      // Copy the input value to the clipboard
      navigator.clipboard.writeText(websiteInput.value).then(() => {
        // Change the text to "Copied"
        copyText.textContent = "Copied";

        // Reset the text back to "Copy" after 2 seconds
        setTimeout(() => {
          copyText.textContent = "Copy";
        }, 2000);
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  // Function to focus the search input
  function focusSearchInput() {
    searchInput.focus();
  }

  // Add click event listener to the search button
  searchButton.addEventListener("click", focusSearchInput);

  // Add keyboard event listener for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  document.addEventListener("keydown", function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault(); // Prevent the default browser behavior
      focusSearchInput();
    }
  });

  // Add keyboard event listener for "/" key
  document.addEventListener("keydown", function (event) {
    if (event.key === "/" && document.activeElement !== searchInput) {
      event.preventDefault(); // Prevent the "/" character from being typed
      focusSearchInput();
    }
  });
});
