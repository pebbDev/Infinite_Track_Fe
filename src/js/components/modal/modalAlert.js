/**
 * Dynamic Modal Alert Component
 * A reusable modal component for displaying alerts with different types and configurations
 */

class ModalAlert {
  constructor() {
    this.activeModal = null;
    this.alertConfig = {
      success: {
        containerClasses: "bg-white dark:bg-gray-900",
        iconClasses: "fill-success-600 dark:fill-success-500",
        iconBgClasses: "fill-success-50 dark:fill-success-500/15",
        buttonClasses: "bg-success-500 hover:bg-success-600",
        iconSvg: `
          <svg
            class="fill-success-600 dark:fill-success-500"
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.9375 19.0004C5.9375 11.7854 11.7864 5.93652 19.0014 5.93652C26.2164 5.93652 32.0653 11.7854 32.0653 19.0004C32.0653 26.2154 26.2164 32.0643 19.0014 32.0643C11.7864 32.0643 5.9375 26.2154 5.9375 19.0004ZM19.0014 2.93652C10.1296 2.93652 2.9375 10.1286 2.9375 19.0004C2.9375 27.8723 10.1296 35.0643 19.0014 35.0643C27.8733 35.0643 35.0653 27.8723 35.0653 19.0004C35.0653 10.1286 27.8733 2.93652 19.0014 2.93652ZM24.7855 17.0575C25.3713 16.4717 25.3713 15.522 24.7855 14.9362C24.1997 14.3504 23.25 14.3504 22.6642 14.9362L17.7177 19.8827L15.3387 17.5037C14.7529 16.9179 13.8031 16.9179 13.2173 17.5037C12.6316 18.0894 12.6316 19.0392 13.2173 19.625L16.657 23.0647C16.9383 23.346 17.3199 23.504 17.7177 23.504C18.1155 23.504 18.4971 23.346 18.7784 23.0647L24.7855 17.0575Z"
              fill=""
            />
          </svg>
        `,
        title: "Success",
        buttonText: "OK",
      },
      info: {
        containerClasses: "bg-white dark:bg-gray-900",
        iconClasses: "fill-blue-light-500 dark:fill-blue-light-500",
        iconBgClasses: "fill-blue-light-50 dark:fill-blue-light-500/15",
        buttonClasses: "bg-blue-light-500 hover:bg-blue-light-600",
        iconSvg: `
          <svg
            class="fill-blue-light-500 dark:fill-blue-light-500"
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.85547 18.9998C5.85547 11.7396 11.7411 5.854 19.0013 5.854C26.2615 5.854 32.1471 11.7396 32.1471 18.9998C32.1471 26.2601 26.2615 32.1457 19.0013 32.1457C11.7411 32.1457 5.85547 26.2601 5.85547 18.9998ZM19.0013 2.854C10.0842 2.854 2.85547 10.0827 2.85547 18.9998C2.85547 27.9169 10.0842 35.1457 19.0013 35.1457C27.9184 35.1457 35.1471 27.9169 35.1471 18.9998C35.1471 10.0827 27.9184 2.854 19.0013 2.854ZM16.9999 11.9145C16.9999 13.0191 17.8953 13.9145 18.9999 13.9145H19.0015C20.106 13.9145 21.0015 13.0191 21.0015 11.9145C21.0015 10.81 20.106 9.91454 19.0015 9.91454H18.9999C17.8953 9.91454 16.9999 10.81 16.9999 11.9145ZM19.0014 27.8171C18.173 27.8171 17.5014 27.1455 17.5014 26.3171V17.3293C17.5014 16.5008 18.173 15.8293 19.0014 15.8293C19.8299 15.8293 20.5014 16.5008 20.5014 17.3293L20.5014 26.3171C20.5014 27.1455 19.8299 27.8171 19.0014 27.8171Z"
              fill=""
            />
          </svg>
        `,
        title: "Information",
        buttonText: "OK",
      },
      warning: {
        containerClasses: "bg-white dark:bg-gray-900",
        iconClasses: "fill-warning-600 dark:fill-orange-400",
        iconBgClasses: "fill-warning-50 dark:fill-warning-500/15",
        buttonClasses: "bg-warning-500 hover:bg-warning-600",
        iconSvg: `
          <svg
            class="fill-warning-600 dark:fill-orange-400"
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M32.1445 19.0002C32.1445 26.2604 26.2589 32.146 18.9987 32.146C11.7385 32.146 5.85287 26.2604 5.85287 19.0002C5.85287 11.7399 11.7385 5.85433 18.9987 5.85433C26.2589 5.85433 32.1445 11.7399 32.1445 19.0002ZM18.9987 35.146C27.9158 35.146 35.1445 27.9173 35.1445 19.0002C35.1445 10.0831 27.9158 2.85433 18.9987 2.85433C10.0816 2.85433 2.85287 10.0831 2.85287 19.0002C2.85287 27.9173 10.0816 35.146 18.9987 35.146ZM21.0001 26.0855C21.0001 24.9809 20.1047 24.0855 19.0001 24.0855L18.9985 24.0855C17.894 24.0855 16.9985 24.9809 16.9985 26.0855C16.9985 27.19 17.894 28.0855 18.9985 28.0855L19.0001 28.0855C20.1047 28.0855 21.0001 27.19 21.0001 26.0855ZM18.9986 10.1829C19.827 10.1829 20.4986 10.8545 20.4986 11.6829L20.4986 20.6707C20.4986 21.4992 19.827 22.1707 18.9986 22.1707C18.1701 22.1707 17.4986 21.4992 17.4986 20.6707L17.4986 11.6829C17.4986 10.8545 18.1701 10.1829 18.9986 10.1829Z"
              fill=""
            />
          </svg>
        `,
        title: "Warning",
        buttonText: "OK",
      },
      danger: {
        containerClasses: "bg-white dark:bg-gray-900",
        iconClasses: "fill-error-600 dark:fill-error-500",
        iconBgClasses: "fill-error-50 dark:fill-error-500/15",
        buttonClasses: "bg-error-500 hover:bg-error-600",
        iconSvg: `
          <svg
            class="fill-error-600 dark:fill-error-500"
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M9.62684 11.7496C9.04105 11.1638 9.04105 10.2141 9.62684 9.6283C10.2126 9.04252 11.1624 9.04252 11.7482 9.6283L18.9985 16.8786L26.2485 9.62851C26.8343 9.04273 27.7841 9.04273 28.3699 9.62851C28.9556 10.2143 28.9556 11.164 28.3699 11.7498L21.1198 18.9999L28.3699 26.25C28.9556 26.8358 28.9556 27.7855 28.3699 28.3713C27.7841 28.9571 26.8343 28.9571 26.2485 28.3713L18.9985 21.1212L11.7482 28.3715C11.1624 28.9573 10.2126 28.9573 9.62684 28.3715C9.04105 27.7857 9.04105 26.836 9.62684 26.2502L16.8771 18.9999L9.62684 11.7496Z"
              fill=""
            />
          </svg>
        `,
        title: "Error",
        buttonText: "OK",
      },
    };
  }
  /**
   * Show a modal alert
   * @param {Object} options - Configuration options
   * @param {string} options.type - Alert type: 'success', 'info', 'warning', 'danger'
   * @param {string} options.title - Custom title (optional)
   * @param {string} options.message - Alert message
   * @param {string} options.buttonText - Custom button text (optional)
   * @param {Function} options.onOk - Callback when OK button is clicked
   * @param {Function} options.onClose - Callback when modal is closed
   * @param {boolean} options.showClose - Show close button (default: true)
   */
  show(options = {}) {
    const {
      type = "info",
      title,
      message = "",
      buttonText,
      onOk,
      onClose,
      showClose = true,
    } = options;

    // Close any existing modal
    this.close();

    const config = this.alertConfig[type] || this.alertConfig.info;
    const modalTitle = title || config.title;
    const modalButtonText = buttonText || config.buttonText;

    // Create modal HTML with new styling
    const modalHTML = `
      <div id="alert-modal" class="fixed inset-0 z-99999 flex items-center justify-center p-5 overflow-y-auto transition-all duration-300 opacity-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" id="modal-backdrop"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-[600px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-10 transform scale-95 transition-all duration-300">
          <!-- Close Button -->
          ${
            showClose
              ? `
          <button
            id="modal-close-btn"
            class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
          `
              : ""
          }

          <!-- Modal Body -->
          <div class="text-center">
            <!-- Icon Container -->
            <div class="relative flex items-center justify-center z-1 mb-7">
              <svg
                class="${config.iconBgClasses || "fill-gray-50 dark:fill-gray-500/15"}"
                width="90"
                height="90"
                viewBox="0 0 90 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M34.364 6.85053C38.6205 -2.28351 51.3795 -2.28351 55.636 6.85053C58.0129 11.951 63.5594 14.6722 68.9556 13.3853C78.6192 11.0807 86.5743 21.2433 82.2185 30.3287C79.7862 35.402 81.1561 41.5165 85.5082 45.0122C93.3019 51.2725 90.4628 63.9451 80.7747 66.1403C75.3648 67.3661 71.5265 72.2695 71.5572 77.9156C71.6123 88.0265 60.1169 93.6664 52.3918 87.3184C48.0781 83.7737 41.9219 83.7737 37.6082 87.3184C29.8831 93.6664 18.3877 88.0266 18.4428 77.9156C18.4735 72.2695 14.6352 67.3661 9.22531 66.1403C-0.462787 63.9451 -3.30193 51.2725 4.49185 45.0122C8.84391 41.5165 10.2138 35.402 7.78151 30.3287C3.42572 21.2433 11.3808 11.0807 21.0444 13.3853C26.4406 14.6722 31.9871 11.951 34.364 6.85053Z"
                  fill=""
                  fill-opacity=""
                />
              </svg>

              <span class="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                ${config.iconSvg || config.icon}
              </span>
            </div>

            <!-- Title -->
            <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
              ${modalTitle}
            </h4>

            <!-- Message -->
            ${
              message
                ? `
            <p class="text-sm leading-6 text-gray-500 dark:text-gray-400 mb-7">
              ${message}
            </p>
            `
                : ""
            }

            <!-- Action Button -->
            <div class="flex items-center justify-center w-full gap-3">
              <button 
                id="modal-ok-btn" 
                class="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg shadow-theme-xs sm:w-auto ${config.buttonClasses}"
              >
                ${modalButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.activeModal = document.getElementById("alert-modal");

    // Setup event listeners
    this.setupEventListeners(onOk, onClose, showClose); // Show modal with animation
    requestAnimationFrame(() => {
      this.activeModal.classList.remove("opacity-0");
      this.activeModal.querySelector(".relative").classList.remove("scale-95");
      this.activeModal.querySelector(".relative").classList.add("scale-100");
    });

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return this.activeModal;
  }

  /**
   * Setup event listeners for the modal
   */
  setupEventListeners(onOk, onClose, showClose) {
    if (!this.activeModal) return;

    const okBtn = this.activeModal.querySelector("#modal-ok-btn");
    const closeBtn = this.activeModal.querySelector("#modal-close-btn");
    const backdrop = this.activeModal.querySelector("#modal-backdrop");

    // OK button click
    if (okBtn) {
      okBtn.addEventListener("click", () => {
        if (onOk && typeof onOk === "function") {
          onOk();
        }
        this.close();
      });
    }

    // Close button click
    if (closeBtn && showClose) {
      closeBtn.addEventListener("click", () => {
        if (onClose && typeof onClose === "function") {
          onClose();
        }
        this.close();
      });
    }

    // Backdrop click
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        if (onClose && typeof onClose === "function") {
          onClose();
        }
        this.close();
      });
    }

    // Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (onClose && typeof onClose === "function") {
          onClose();
        }
        this.close();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }
  /**
   * Close the active modal
   */
  close() {
    if (!this.activeModal) return;

    // Animate out
    this.activeModal.classList.add("opacity-0");
    const modalContent = this.activeModal.querySelector(".relative");
    if (modalContent) {
      modalContent.classList.remove("scale-100");
      modalContent.classList.add("scale-95");
    }

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.activeModal && this.activeModal.parentNode) {
        this.activeModal.parentNode.removeChild(this.activeModal);
      }
      this.activeModal = null;

      // Restore body scroll
      document.body.style.overflow = "";
    }, 300);
  }

  /**
   * Check if a modal is currently active
   */
  isActive() {
    return this.activeModal !== null;
  }
}

// Create global instance
const modalAlert = new ModalAlert();

/**
 * Global function to show alert modal (backward compatibility)
 * @param {Object} options - Configuration options
 */
window.showAlertModal = function (options) {
  return modalAlert.show(options);
};

// Convenience methods for different alert types
window.showSuccessAlert = function (message, options = {}) {
  return modalAlert.show({ ...options, type: "success", message });
};

window.showInfoAlert = function (message, options = {}) {
  return modalAlert.show({ ...options, type: "info", message });
};

window.showWarningAlert = function (message, options = {}) {
  return modalAlert.show({ ...options, type: "warning", message });
};

window.showDangerAlert = function (message, options = {}) {
  return modalAlert.show({ ...options, type: "danger", message });
};

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ModalAlert, modalAlert };
}
