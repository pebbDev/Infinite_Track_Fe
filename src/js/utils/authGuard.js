/**
 * Authentication Guard
 * Middleware untuk mengecek autentikasi dan redirect jika diperlukan
 */

import { isAuthenticated, getCurrentUser } from '../services/authService.js';

/**
 * Initialize authentication guard
 */
function initAuthGuard() {
  // Daftar halaman yang memerlukan autentikasi
  const protectedPages = [
    '/index.html',
    '/profile.html',
    '/management-user.html',
    '/management-booking.html',
    '/management-attendance.html',
    '/calendar.html',
    '/form-user.html',
    '/alerts.html',
    '/badge.html',
    '/buttons.html',
    '/blank.html'
  ];

  // Daftar halaman publik (tidak perlu autentikasi)
  const publicPages = [
    '/signin.html',
    '/404.html'
  ];

  // Jalankan pengecekan
  checkAuthentication();
}

/**
 * Check authentication status dan redirect jika diperlukan
 */
function checkAuthentication() {
  const currentPath = window.location.pathname;
  const currentPage = getCurrentPageFromPath(currentPath);
  
  console.log('Auth guard checking page:', currentPage);

  // Jika di halaman signin dan sudah login, redirect ke dashboard
  if (currentPage === '/signin.html' && isAuthenticated()) {
    console.log('User already authenticated, redirecting to dashboard');
    window.location.href = '/index.html';
    return;
  }

  // Jika di halaman protected dan belum login, redirect ke signin
  if (isProtectedPage(currentPage) && !isAuthenticated()) {
    console.log('User not authenticated, redirecting to signin');
    
    // Simpan current URL untuk redirect setelah login
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    
    window.location.href = '/signin.html';
    return;
  }

  // Jika sudah login, update Alpine store
  if (isAuthenticated()) {
    updateAlpineAuthStore();
  }

  console.log('Auth guard check completed');
}

/**
 * Get current page from URL path
 * @param {string} path - URL path
 * @returns {string} - Normalized page path
 */
function getCurrentPageFromPath(path) {
  // Handle root path
  if (path === '/' || path === '') {
    return '/index.html';
  }

  // Handle paths without .html extension
  if (!path.includes('.') && !path.endsWith('/')) {
    return path + '.html';
  }

  // Handle paths ending with /
  if (path.endsWith('/')) {
    return path + 'index.html';
  }

  return path;
}

/**
 * Check if current page requires authentication
 * @param {string} page - Page path
 * @returns {boolean} - True if page is protected
 */
function isProtectedPage(page) {
  const protectedPages = [
    '/index.html',
    '/profile.html',
    '/management-user.html',
    '/management-booking.html',
    '/management-attendance.html',
    '/calendar.html',
    '/form-user.html',
    '/alerts.html',
    '/badge.html',
    '/buttons.html',
    '/blank.html'
  ];

  return protectedPages.includes(page);
}

/**
 * Update Alpine.js auth store with current user data
 */
function updateAlpineAuthStore() {
  if (typeof Alpine !== 'undefined' && Alpine.store && Alpine.store('auth')) {
    const userData = getCurrentUser();
    if (userData) {
      Alpine.store('auth').setUser(userData);
    }
  }
}

/**
 * Redirect to login page
 * @param {string} returnUrl - URL to return to after login
 */
function redirectToLogin(returnUrl = null) {
  if (returnUrl) {
    sessionStorage.setItem('redirectAfterLogin', returnUrl);
  }
  window.location.href = '/signin.html';
}

/**
 * Redirect to dashboard
 */
function redirectToDashboard() {
  window.location.href = '/index.html';
}

/**
 * Check if user has permission for specific action
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
function hasPermission(permission) {
  if (!isAuthenticated()) {
    return false;
  }

  const userData = getCurrentUser();
  if (!userData || !userData.permissions) {
    return false;
  }

  return userData.permissions.includes(permission);
}

/**
 * Guard untuk fungsi yang memerlukan permission tertentu
 * @param {string} permission - Permission yang diperlukan
 * @param {Function} callback - Fungsi yang akan dijalankan jika ada permission
 * @param {Function} onDenied - Fungsi yang dijalankan jika tidak ada permission
 */
function requirePermission(permission, callback, onDenied = null) {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  if (!hasPermission(permission)) {
    if (onDenied) {
      onDenied();
    } else {
      alert('Anda tidak memiliki permission untuk melakukan aksi ini.');
    }
    return;
  }

  callback();
}

// Export functions
const AuthGuard = {
  init: initAuthGuard,
  checkAuthentication,
  isProtectedPage,
  redirectToLogin,
  redirectToDashboard,
  hasPermission,
  requirePermission
};

export { 
  initAuthGuard, 
  checkAuthentication, 
  isProtectedPage, 
  redirectToLogin, 
  redirectToDashboard,
  hasPermission,
  requirePermission
};

export default AuthGuard;

// Untuk penggunaan global di browser
if (typeof window !== 'undefined') {
  window.AuthGuard = AuthGuard;
}

// Auto-initialize jika bukan di halaman signin
if (typeof window !== 'undefined') {
  const currentPage = getCurrentPageFromPath(window.location.pathname);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Delay sedikit untuk memastikan semua module sudah loaded
      setTimeout(initAuthGuard, 100);
    });
  } else {
    setTimeout(initAuthGuard, 100);
  }
}
