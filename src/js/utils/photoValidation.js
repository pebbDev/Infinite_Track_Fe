/**
 * Photo Validation Utility
 * Fungsi untuk validasi file foto sebelum upload ke Cloudinary
 * Update untuk integrasi dengan Cloudinary backend
 */

import { envLog } from "../config/env.js";

/**
 * Konstanta untuk validasi foto - disesuaikan dengan spesifikasi Cloudinary
 */
const PHOTO_CONFIG = {
  // Maksimal ukuran file: 20MB
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB dalam bytes

  // Format file yang diizinkan
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],

  // Ekstensi file yang diizinkan
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],

  // Nama field yang wajib untuk FormData
  FIELD_NAME: "face_photo",
};

// Export konstanta lama untuk backward compatibility
const PHOTO_VALIDATION = PHOTO_CONFIG;

/**
 * Validasi file foto sebelum upload
 * @param {File} file - File yang akan divalidasi
 * @returns {Object} - Hasil validasi dengan properti isValid dan message
 */
function validatePhotoFile(file) {
  if (!file) {
    return {
      isValid: false,
      error: "Harap pilih file foto terlebih dahulu.",
    };
  }

  // Validasi ukuran file
  if (file.size > PHOTO_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = PHOTO_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      isValid: false,
      error: `File terlalu besar. Maksimal ${maxSizeMB}MB.`,
    };
  }
  // Validasi tipe file
  if (!PHOTO_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.",
    };
  }

  // Validasi ekstensi file
  const fileName = file.name.toLowerCase();
  const hasValidExtension = PHOTO_CONFIG.ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Membuat preview gambar dari file yang dipilih (dengan Promise)
 * @param {File} file - File gambar * @returns {Promise<string>} - Promise yang resolve dengan URL preview
 */
function createPhotoPreview(file) {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        reject(new Error("File tidak ditemukan"));
        return;
      }

      // Validasi file terlebih dahulu
      const validation = validatePhotoFile(file);
      if (!validation.isValid) {
        reject(new Error(validation.error));
        return;
      }

      // Menggunakan URL.createObjectURL untuk performa yang lebih baik
      const previewUrl = URL.createObjectURL(file);
      resolve(previewUrl);
    } catch (error) {
      console.error("Error creating photo preview:", error);
      reject(error);
    }
  });
}

/**
 * Membuat preview gambar dari file yang dipilih (dengan callback - untuk kompatibilitas)
 * @param {File} file - File gambar * @param {Function} callback - Callback yang akan dipanggil dengan URL preview
 */
function createPhotoPreviewCallback(file, callback) {
  if (!file || typeof callback !== "function") {
    return;
  }

  // Validasi file terlebih dahulu
  const validation = validatePhotoFile(file);
  if (!validation.isValid) {
    callback(null, validation.error);
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    callback(e.target.result, null);
  };

  reader.onerror = function () {
    callback(null, "Gagal membaca file gambar");
  };

  reader.readAsDataURL(file);
}

/**
 * Membersihkan URL preview yang sudah tidak digunakan * @param {string} previewUrl - URL preview yang dibuat dengan createPhotoPreview
 */
function cleanupPhotoPreview(previewUrl) {
  try {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
      console.debug("Photo preview URL cleaned up:", previewUrl);
    }
  } catch (error) {
    console.error("Error cleaning up photo preview:", error);
  }
}

/**
 * Format ukuran file menjadi string yang mudah dibaca
 * @param {number} sizeInBytes - Ukuran file dalam bytes * @returns {string} - Ukuran file yang diformat
 */
function formatFileSize(sizeInBytes) {
  if (sizeInBytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

  return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Membuat FormData dengan file foto untuk upload
 * @param {File} photoFile - File foto yang akan diupload
 * @param {Object} additionalData - Data tambahan yang akan ditambahkan ke FormData (opsional) * @returns {FormData} - FormData object yang siap untuk upload
 */
function createPhotoFormData(photoFile, additionalData = {}) {
  try {
    const formData = new FormData();

    // Tambahkan file foto dengan nama field yang sesuai
    if (photoFile) {
      formData.append(PHOTO_CONFIG.FIELD_NAME, photoFile);
    }

    // Tambahkan data tambahan jika ada
    Object.keys(additionalData).forEach((key) => {
      const value = additionalData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    console.debug("Photo FormData created with fields:", [...formData.keys()]);

    return formData;
  } catch (error) {
    console.error("Error creating photo FormData:", error);
    throw error;
  }
}

/**
 * Error handler untuk error upload foto yang spesifik sesuai dokumentasi Cloudinary
 * @param {Error} error - Error yang terjadi saat upload * @returns {string} - Pesan error yang user-friendly
 */
function handlePhotoUploadError(error) {
  const errorMessage = error.message || error.toString();

  // Error spesifik dari backend berdasarkan dokumentasi
  if (
    errorMessage.includes("face_photo") ||
    errorMessage.includes("tidak ditemukan")
  ) {
    return "Upload gambar wajah gagal atau tidak ditemukan. Pastikan Anda memilih file foto yang valid.";
  }

  if (
    errorMessage.includes("File terlalu besar") ||
    errorMessage.includes("20MB")
  ) {
    return "File terlalu besar. Maksimal 20MB.";
  }

  if (
    errorMessage.includes("Format file tidak didukung") ||
    errorMessage.includes("JPEG") ||
    errorMessage.includes("PNG") ||
    errorMessage.includes("WebP")
  ) {
    return "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.";
  }

  if (
    errorMessage.includes("cloud storage") ||
    errorMessage.includes("cloudinary")
  ) {
    return "Gagal mengupload foto ke cloud storage. Silakan coba lagi nanti.";
  }

  if (errorMessage.includes("Sesi")) {
    return "Sesi Anda telah berakhir. Silakan login kembali.";
  }

  if (errorMessage.includes("akses")) {
    return "Anda tidak memiliki akses untuk mengupdate foto pengguna.";
  }

  // Untuk error dari axios response
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 413:
        return "File terlalu besar. Maksimal 20MB.";
      case 422:
        return (
          data?.message ||
          "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP."
        );
      case 400:
        return (
          data?.message ||
          'Upload gambar wajah gagal atau tidak ditemukan. Pastikan field name adalah "face_photo".'
        );
      case 500:
        return "Gagal mengupload foto ke cloud storage. Silakan coba lagi nanti.";
      case 401:
        return "Sesi Anda telah berakhir. Silakan login kembali.";
      case 403:
        return "Anda tidak memiliki akses untuk mengupdate foto pengguna.";
      case 404:
        return "Pengguna tidak ditemukan.";
      default:
        return data?.message || `Error ${status}: Gagal mengupload foto.`;
    }
  } else if (error.request) {
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  } else {
    // Default error message
    return (
      errorMessage ||
      "Terjadi kesalahan saat mengupload foto. Silakan coba lagi."
    );
  }
}

/**
 * Mengecek apakah URL adalah URL Cloudinary yang valid
 * @param {string} url - URL yang akan dicek * @returns {boolean} - True jika URL adalah Cloudinary URL
 */
function isCloudinaryUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Pattern untuk mendeteksi URL Cloudinary
  const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/.+/;
  return cloudinaryPattern.test(url);
}

/**
 * Mendapatkan URL foto pengguna dengan fallback ke foto default
 * @param {string|null} photoUrl - URL foto dari API
 * @param {string} defaultPhotoPath - Path foto default (opsional) * @returns {string} - URL foto yang siap digunakan
 */
function getUserPhotoUrl(
  photoUrl,
  defaultPhotoPath = "/src/images/user/default-avatar.jpg",
) {
  try {
    // Jika ada URL foto dan itu adalah URL Cloudinary yang valid, gunakan langsung
    if (photoUrl && isCloudinaryUrl(photoUrl)) {
      return photoUrl;
    }

    // Jika ada URL foto tapi bukan Cloudinary (legacy), gunakan juga langsung
    if (photoUrl && typeof photoUrl === "string" && photoUrl.trim() !== "") {
      return photoUrl;
    }

    // Fallback ke foto default
    return defaultPhotoPath;
  } catch (error) {
    console.error("Error getting user photo URL:", error);
    return defaultPhotoPath;
  }
}

/**
 * Mengecek apakah browser mendukung file API * @returns {boolean} - true jika browser mendukung file API
 */
function isFileAPISupported() {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
}

/**
 * Mengecek apakah file yang dipilih adalah gambar
 * @param {File} file - File yang akan dicek * @returns {boolean} - true jika file adalah gambar
 */
function isImageFile(file) {
  if (!file) return false;
  return file.type.startsWith("image/");
}

/**
 * Validasi file foto dengan callback untuk kompatibilitas
 * @param {File} file - File yang akan divalidasi * @param {Function} callback - Callback dengan signature (isValid, errorMessage)
 */
function validatePhotoFileCallback(file, callback) {
  if (typeof callback !== "function") return;

  const result = validatePhotoFile(file);
  callback(result.isValid, result.error);
}

// Export semua fungsi
export {
  // Konstanta
  PHOTO_CONFIG,
  PHOTO_VALIDATION,

  // Fungsi utama
  validatePhotoFile,
  createPhotoPreview,
  createPhotoPreviewCallback,
  cleanupPhotoPreview,
  formatFileSize,
  createPhotoFormData,
  handlePhotoUploadError,
  isCloudinaryUrl,
  getUserPhotoUrl,

  // Fungsi tambahan
  isFileAPISupported,
  isImageFile,
  validatePhotoFileCallback,
};
