import Swal from "sweetalert2";

const base = {
  customClass: { popup: "finance-theme" },
  confirmButtonColor: "#1d4ed8",
  cancelButtonColor: "#5f6f7e",
};


export const alertLoading = (title = "Procesando…", text = "Por favor espera un momento.") =>
  Swal.fire({
    ...base,
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

export const alertSuccess = (text: string, title = "¡Listo!") =>
  Swal.fire({
    ...base,
    icon: "success",
    title,
    text,
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export const alertError = (text: string, title = "Ocurrió un problema") =>
  Swal.fire({
    ...base,
    icon: "error",
    title,
    text,
    confirmButtonText: "Entendido",
  });

export const confirmDanger = async (
  title: string,
  text: string,
  confirmText: string,
): Promise<boolean> => {
  const { isConfirmed } = await Swal.fire({
    ...base,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Volver",
    confirmButtonColor: "#c8373c",
    reverseButtons: true,
    focusCancel: true,
  });
  return isConfirmed;
};