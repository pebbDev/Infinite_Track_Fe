/**
 * User Storage Utility
 * Mengelola penyimpanan dan pengambilan data pengguna dari localStorage
 */

/**
 * Menyimpan data pengguna ke localStorage
 * @param {Object} userData - Objek data pengguna yang akan disimpan
 * @returns {boolean} - true jika berhasil, false jika gagal
 */
function saveUserToStorage(userData) {
  try {
    if (!userData || typeof userData !== "object") {
      console.error("saveUserToStorage: userData harus berupa objek");
      return false;
    }

    const userDataString = JSON.stringify(userData);
    localStorage.setItem("currentUserData", userDataString);
    return true;
  } catch (error) {
    console.error("Error saving user data to localStorage:", error);
    return false;
  }
}

/**
 * Mengambil data pengguna dari localStorage
 * @returns {Object|null} - Objek data pengguna atau null jika tidak ada/error
 */
function getUserFromStorage() {
  try {
    const userDataString = localStorage.getItem("currentUserData");

    if (!userDataString) {
      return null;
    }

    const userData = JSON.parse(userDataString);
    return userData;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
}

/**
 * Menghapus data pengguna dari localStorage
 * @returns {boolean} - true jika berhasil, false jika gagal
 */
function removeUserFromStorage() {
  try {
    localStorage.removeItem("currentUserData");
    return true;
  } catch (error) {
    console.error("Error removing user data from localStorage:", error);
    return false;
  }
}

/**
 * Mengecek apakah ada data pengguna yang tersimpan
 * @returns {boolean} - true jika ada data pengguna, false jika tidak
 */
function hasUserInStorage() {
  try {
    const userData = getUserFromStorage();
    return userData !== null && typeof userData === "object";
  } catch (error) {
    console.error("Error checking user data in localStorage:", error);
    return false;
  }
}

/**
 * Memperbarui sebagian data pengguna di localStorage
 * @param {Object} updatedData - Data yang akan diperbarui
 * @returns {boolean} - true jika berhasil, false jika gagal
 */
function updateUserInStorage(updatedData) {
  try {
    const currentUser = getUserFromStorage();

    if (!currentUser) {
      console.error(
        "updateUserInStorage: Tidak ada data pengguna yang tersimpan",
      );
      return false;
    }

    const mergedData = { ...currentUser, ...updatedData };
    return saveUserToStorage(mergedData);
  } catch (error) {
    console.error("Error updating user data in localStorage:", error);
    return false;
  }
}

// Export fungsi untuk penggunaan sebagai module
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    saveUserToStorage,
    getUserFromStorage,
    removeUserFromStorage,
    hasUserInStorage,
    updateUserInStorage,
  };
}

// Untuk penggunaan global di browser
if (typeof window !== "undefined") {
  window.UserStorage = {
    saveUserToStorage,
    getUserFromStorage,
    removeUserFromStorage,
    hasUserInStorage,
    updateUserInStorage,
  };
}

export {
  saveUserToStorage,
  getUserFromStorage,
  removeUserFromStorage,
  hasUserInStorage,
  updateUserInStorage,
};
