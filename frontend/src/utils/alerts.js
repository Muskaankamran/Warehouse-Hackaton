import Swal from "sweetalert2";

const customClass = {
  popup: "swal-popup",
  title: "swal-title",
  htmlContainer: "swal-message",
  confirmButton: "swal-confirm-button",
  cancelButton: "swal-cancel-button",
};

export function showSuccessAlert(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "success",
    timer: 1800,
    showConfirmButton: false,
    customClass,
  });
}

export function showErrorAlert(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Close",
    customClass,
    buttonsStyling: false,
  });
}

export async function confirmAction(title, text, confirmButtonText = "Yes, continue") {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    customClass,
    buttonsStyling: false,
  });

  return result.isConfirmed;
}
