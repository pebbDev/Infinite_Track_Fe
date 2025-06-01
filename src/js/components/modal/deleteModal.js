/**
 * Delete Modal Component
 * A reusable modal component for delete confirmations
 */

class DeleteModal {
  constructor() {
    this.currentDeleteCallback = null;
    this.currentDeleteData = null;
  }

  /**
   * Show delete confirmation modal
   * @param {Object} options - Configuration options
   * @param {string} options.title - Custom title (optional)
   * @param {string} options.message - Delete confirmation message
   * @param {Function} options.onConfirm - Callback when delete is confirmed
   * @param {Object} options.data - Data to pass to the delete callback
   */
  show(options = {}) {
    const {
      title = "Konfirmasi Hapus Data",
      message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
      onConfirm,
      data = null,
    } = options;

    this.currentDeleteCallback = onConfirm;
    this.currentDeleteData = data;

    // Update Alpine.js data using the body element
    const bodyElement = document.body;
    if (bodyElement._x_dataStack && bodyElement._x_dataStack[0]) {
      bodyElement._x_dataStack[0].deleteConfirmMessage = message;
      bodyElement._x_dataStack[0].isDeleteModalOpen = true;
    }
  }

  /**
   * Confirm delete action
   */
  confirmDelete() {
    if (
      this.currentDeleteCallback &&
      typeof this.currentDeleteCallback === "function"
    ) {
      this.currentDeleteCallback(this.currentDeleteData);
    }
    this.close();
  }

  /**
   * Close the delete modal
   */
  close() {
    const bodyElement = document.body;
    if (bodyElement._x_dataStack && bodyElement._x_dataStack[0]) {
      bodyElement._x_dataStack[0].isDeleteModalOpen = false;
    }

    // Reset data
    this.currentDeleteCallback = null;
    this.currentDeleteData = null;
  }
}

// Create global instance
const deleteModal = new DeleteModal();

/**
 * Global function to show delete confirmation modal
 * @param {Object} options - Configuration options
 */
window.showDeleteModal = function (options) {
  return deleteModal.show(options);
};

/**
 * Global function to confirm delete (called from Alpine.js)
 */
window.confirmDelete = function () {
  return deleteModal.confirmDelete();
};

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DeleteModal, deleteModal };
}
