/**
 * Logout Component
 * Komponen untuk menangani logout user
 */

import { logout } from '../services/authService.js';

/**
 * Initialize logout handlers
 */
function initLogoutHandlers() {
  // Tunggu hingga DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLogoutHandlers);
  } else {
    setupLogoutHandlers();
  }
}

/**
 * Setup logout event handlers
 */
function setupLogoutHandlers() {
  // Cari semua elemen logout (button, link, dll)
  const logoutElements = document.querySelectorAll(
    '[data-logout], .logout-btn, .logout-link, button[onclick*="logout"], a[onclick*="logout"]'
  );

  logoutElements.forEach(element => {
    element.addEventListener('click', handleLogoutClick);
  });

  // Setup keyboard shortcut untuk logout (Ctrl+Shift+L)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
      event.preventDefault();
      handleLogoutClick();
    }
  });

  console.log(`Logout handlers setup for ${logoutElements.length} elements`);
}

/**
 * Handle logout click event
 * @param {Event} event - Click event
 */
async function handleLogoutClick(event) {
  if (event) {
    event.preventDefault();
  }

  // Konfirmasi logout
  const confirmLogout = await showLogoutConfirmation();
  if (!confirmLogout) {
    return;
  }

  await performLogout();
}

/**
 * Show logout confirmation dialog
 * @returns {Promise<boolean>} - True if user confirms logout
 */
function showLogoutConfirmation() {
  return new Promise((resolve) => {
    // Coba gunakan SweetAlert jika tersedia
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
      }).then((result) => {
        resolve(result.isConfirmed);
      });
    } 
    // Fallback ke confirm dialog browser
    else {
      const confirmed = confirm('Apakah Anda yakin ingin keluar?');
      resolve(confirmed);
    }
  });
}

/**
 * Perform logout process
 */
async function performLogout() {
  try {
    // Show loading state
    showLogoutLoading();

    // Call logout service
    await logout();

    // Update Alpine.js store
    updateAlpineStoreOnLogout();

    // Show success message
    showLogoutSuccess();

    // Redirect to signin page after short delay
    setTimeout(() => {
      window.location.href = '/signin.html';
    }, 1000);

  } catch (error) {
    console.error('Logout error:', error);
    
    // Show error message
    showLogoutError(error.message);
    
    // Force logout anyway (clear local data)
    forceLogout();
  }
}

/**
 * Show loading state during logout
 */
function showLogoutLoading() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Logging out...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }
}

/**
 * Show logout success message
 */
function showLogoutSuccess() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Logout Berhasil',
      text: 'Anda telah berhasil keluar',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    });
  }
}

/**
 * Show logout error message
 * @param {string} errorMessage - Error message to display
 */
function showLogoutError(errorMessage) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Logout Error',
      text: errorMessage || 'Terjadi kesalahan saat logout',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  } else {
    alert(`Logout Error: ${errorMessage || 'Terjadi kesalahan saat logout'}`);
  }
}

/**
 * Update Alpine.js store on logout
 */
function updateAlpineStoreOnLogout() {
  if (typeof Alpine !== 'undefined' && Alpine.store && Alpine.store('auth')) {
    Alpine.store('auth').clearAuth();
    console.log('Alpine.js auth store cleared on logout');
  }
}

/**
 * Force logout (clear local data without API call)
 */
function forceLogout() {
  try {
    // Clear localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Update Alpine store
    updateAlpineStoreOnLogout();
    
    // Redirect to signin
    window.location.href = '/signin.html';
    
  } catch (error) {
    console.error('Force logout error:', error);
    // Last resort: reload page
    window.location.reload();
  }
}

/**
 * Programmatic logout function (can be called from other modules)
 * @param {boolean} skipConfirmation - Skip confirmation dialog
 */
async function logoutUser(skipConfirmation = false) {
  if (skipConfirmation) {
    await performLogout();
  } else {
    await handleLogoutClick();
  }
}

// Export functions
const LogoutComponent = {
  init: initLogoutHandlers,
  logout: logoutUser,
  forceLogout
};

export { initLogoutHandlers, logoutUser, forceLogout };
export default LogoutComponent;

// Untuk penggunaan global di browser
if (typeof window !== 'undefined') {
  window.LogoutComponent = LogoutComponent;
  window.logoutUser = logoutUser;
}

// Auto-initialize
initLogoutHandlers();
