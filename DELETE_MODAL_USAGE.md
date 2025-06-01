# Delete Confirmation Modal Usage Guide

## Overview

A reusable delete confirmation modal component that follows the same design pattern as the existing booking table's delete functionality.

## Files Created

- `src/partials/modal/delete-confirmation-modal.html` - Modal HTML template
- `src/js/components/modal/deleteModal.js` - JavaScript controller

## Integration

The modal has been integrated into:

- `src/js/index.js` - Import added
- `src/management-booking.html` - Alpine.js state variables and modal include added

## Usage

### Basic Usage

```javascript
window.showDeleteModal({
  message: "Apakah Anda yakin ingin menghapus data ini?",
  onConfirm: function (data) {
    console.log("Delete confirmed!");
    // Your delete logic here
  },
});
```

### Advanced Usage with Custom Title and Data

```javascript
window.showDeleteModal({
  title: "Konfirmasi Hapus User",
  message: `Apakah Anda yakin ingin menghapus user "${userName}" (${userId})?`,
  onConfirm: function (data) {
    // Delete logic with passed data
    console.log(`Deleting user: ${data.userName} (${data.userId})`);

    // Call your API to delete
    deleteUser(data.userId).then(() => {
      // Show success notification
      window.showAlertModal({
        type: "success",
        title: "User Dihapus",
        message: `User "${data.userName}" berhasil dihapus`,
        buttonText: "OK",
      });
    });
  },
  data: { userId: userId, userName: userName },
});
```

### HTML Button Example

```html
<button
  class="js-delete-user-btn text-red-500 hover:text-red-700"
  data-user-id="123"
  data-user-name="John Doe"
>
  <svg class="h-5 w-5" viewBox="0 0 20 20">
    <!-- Delete icon -->
  </svg>
</button>
```

### JavaScript Event Handler Example

```javascript
document.querySelectorAll(".js-delete-user-btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault();

    const userId = this.getAttribute("data-user-id");
    const userName = this.getAttribute("data-user-name");

    window.showDeleteModal({
      title: "Konfirmasi Hapus User",
      message: `Apakah Anda yakin ingin menghapus user "${userName}" (${userId})?`,
      onConfirm: function (data) {
        // Your delete logic here
        console.log(`Deleting: ${data.userName} (${data.userId})`);
      },
      data: { userId, userName },
    });
  });
});
```

## Alpine.js State Variables

The following variables need to be added to your Alpine.js data:

```javascript
{
  isDeleteModalOpen: false,
  deleteConfirmMessage: ''
}
```

## Modal Configuration Options

- `title` (optional): Custom modal title (default: "Konfirmasi Hapus Data")
- `message` (required): Confirmation message to display
- `onConfirm` (required): Callback function when delete is confirmed
- `data` (optional): Data object to pass to the onConfirm callback

## Design Features

- Error-themed styling with red color scheme
- Danger icons for visual emphasis
- Backdrop blur effect
- Smooth Alpine.js transitions
- Close button and outside click to cancel
- Responsive design (mobile-friendly)
- Dark mode support

## Current Implementation

The booking table delete buttons now use this new modal instead of the generic alert modal, providing a more consistent and purpose-built user experience for delete confirmations.
