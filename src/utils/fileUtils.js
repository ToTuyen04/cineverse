/**
 * Convert File object to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  if (!file) return { isValid: false, error: "No file selected" };

  if (!file.type.match("image.*")) {
    return { isValid: false, error: "Please select an image file" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: "Image size should be less than 5MB" };
  }

  return { isValid: true, error: null };
};
