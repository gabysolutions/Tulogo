const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface CloudinaryUploadResult {
  url: string; // secure_url — la que guardas en tu backend
  publicId: string; // útil si luego quieres poder borrar/transformar la imagen
  width: number;
  height: number;
}

/**
 * Sube un archivo directo al navegador -> Cloudinary usando un
 * upload preset "unsigned" (Settings > Upload > Upload presets > Add upload preset,
 * Signing Mode = Unsigned, en tu dashboard de Cloudinary).
 *
 * No pasa por tu backend. Cuando tengas tu backend, después de llamar esto
 * mandas la URL resultante a tu API para persistir el registro del archivo
 * (ver el TODO en DesignCard.tsx).
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Faltan VITE_CLOUDINARY_CLOUD_NAME o VITE_CLOUDINARY_UPLOAD_PRESET en tu .env",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error?.message ?? `Error al subir a Cloudinary (${response.status})`,
    );
  }

  const data = await response.json();

  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  };
}

/** Sube varios archivos en paralelo y devuelve sus resultados en el mismo orden. */
export async function uploadManyToCloudinary(
  files: File[],
): Promise<CloudinaryUploadResult[]> {
  return Promise.all(files.map((f) => uploadToCloudinary(f)));
}