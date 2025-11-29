import { supabase } from "./supabase";

/**
 * Upload an image file to Supabase Storage and return the public URL
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder name ('bahan' or 'produk')
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImage(file, folder) {
  if (!file) return null;

  // Create a unique filename with timestamp
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = file.name.split(".").pop();
  const fileName = `${folder}-${timestamp}-${randomStr}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  try {
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from(folder).upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage.from(folder).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - The public URL of the image to delete
 * @param {string} folder - The folder name ('bahan' or 'produk')
 */
export async function deleteImage(imageUrl, folder) {
  if (!imageUrl) return;

  try {
    // Extract the file path from the public URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage.from(folder).remove([filePath]);
    if (error) throw error;
  } catch (error) {
    console.error("Image delete error:", error);
    // Don't throw here - deletion failure shouldn't block the app
  }
}

export default {
  uploadImage,
  deleteImage,
};
