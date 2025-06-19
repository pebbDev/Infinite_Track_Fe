/**
 * Photo Utilities
 * Fungsi utilitas untuk validasi dan penanganan foto sesuai dengan spesifikasi Cloudinary
 */

import { envLog } from "../config/env.js";

// Konstanta konfigurasi foto
export const PHOTO_CONFIG = {
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB dalam bytes
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  FIELD_NAME: "face_photo",
};

/**
 * Validasi file foto sebelum upload
 * @param {File} file - File yang akan divalidasi
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export function validatePhotoFile(file) {
  try {
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

    // Validasi ekstensi file (backup validation)
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

    envLog("debug", "Photo file validation passed:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    return {
      isValid: true,
      error: null,
    };
  } catch (error) {
    envLog("error", "Error validating photo file:", error);
    return {
      isValid: false,
      error: "Terjadi kesalahan saat memvalidasi file.",
    };
  }
}

/**
 * Membuat preview URL untuk gambar yang dipilih
 * @param {File} file - File gambar
 * @returns {Promise<string>} - Promise yang resolve dengan URL preview
 */
export function createPhotoPreview(file) {
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
      envLog("error", "Error creating photo preview:", error);
      reject(error);
    }
  });
}

/**
 * Membersihkan URL preview yang sudah tidak digunakan
 * @param {string} previewUrl - URL preview yang dibuat dengan createPhotoPreview
 */
export function cleanupPhotoPreview(previewUrl) {
  try {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
      envLog("debug", "Photo preview URL cleaned up:", previewUrl);
    }
  } catch (error) {
    envLog("error", "Error cleaning up photo preview:", error);
  }
}

/**
 * Memformat ukuran file menjadi string yang mudah dibaca
 * @param {number} bytes - Ukuran file dalam bytes
 * @returns {string} - Ukuran file dalam format yang mudah dibaca
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Membuat FormData dengan file foto untuk upload
 * @param {File} photoFile - File foto yang akan diupload
 * @param {Object} additionalData - Data tambahan yang akan ditambahkan ke FormData (opsional)
 * @returns {FormData} - FormData object yang siap untuk upload
 */
export function createPhotoFormData(photoFile, additionalData = {}) {
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

    envLog("debug", "Photo FormData created with fields:", [
      ...formData.keys(),
    ]);

    return formData;
  } catch (error) {
    envLog("error", "Error creating photo FormData:", error);
    throw error;
  }
}

/**
 * Memeriksa apakah URL adalah URL Cloudinary yang valid
 * @param {string} url - URL yang akan diperiksa
 * @returns {boolean} - true jika URL adalah URL Cloudinary yang valid
 */
export function isCloudinaryUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Memeriksa apakah URL mengandung domain Cloudinary
  const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/.+/;
  return cloudinaryPattern.test(url);
}

/**
 * Mendapatkan URL foto pengguna dengan fallback ke foto default
 * @param {string|null} photoUrl - URL foto dari API
 * @param {string} defaultPhotoPath - Path foto default (opsional)
 * @returns {string} - URL foto yang siap digunakan
 */
export function getUserPhotoUrl(
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
    envLog("error", "Error getting user photo URL:", error);
    return defaultPhotoPath;
  }
}

/**
 * Mengecek apakah browser mendukung file API
 * @returns {boolean} - true jika browser mendukung file API
 */
export function isFileAPISupported() {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
}

/**
 * Error handler untuk error upload foto yang spesifik
 * @param {Error} error - Error yang terjadi saat upload
 * @returns {string} - Pesan error yang user-friendly
 */
export function handlePhotoUploadError(error) {
  const errorMessage = error.message || error.toString();

  // Error spesifik dari backend berdasarkan dokumentasi
  if (errorMessage.includes("face_photo")) {
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
    errorMessage.includes("JPEG")
  ) {
    return "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.";
  }

  if (errorMessage.includes("cloud storage")) {
    return "Gagal mengupload foto ke cloud storage. Silakan coba lagi nanti.";
  }

  if (errorMessage.includes("Sesi")) {
    return "Sesi Anda telah berakhir. Silakan login kembali.";
  }

  if (errorMessage.includes("akses")) {
    return "Anda tidak memiliki akses untuk mengupdate foto pengguna.";
  }

  // Default error message
  return (
    errorMessage || "Terjadi kesalahan saat mengupload foto. Silakan coba lagi."
  );
}
