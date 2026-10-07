import { http } from "./http";

export const deleteFileService = async (
  fileId: number
): Promise<{ message: string }> => {
  const { data } = await http.delete<{ message: string }>(`/file/${fileId}`);
  return data;
};