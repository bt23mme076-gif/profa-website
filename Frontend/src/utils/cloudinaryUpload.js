import axios from 'axios';

// Cloudinary configuration
const CLOUD_NAME = 'URvRGQtLejhcD8mBpW2k17SUDBQ';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = 'iima_courses'; // You need to create this in Cloudinary dashboard

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {string} type - Type of content (e.g., 'courses', 'blogs', 'testimonials', 'logos', 'home')
 * @returns {Promise<string>} - URL of uploaded image
 */
export const uploadToCloudinary = async (file, type = 'general') => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image size should be less than 5MB');
  }

  // Map type to subfolder
  const folderMap = {
    courses: 'iima-courses/courses',
    blogs: 'iima-courses/blogs',
    testimonials: 'iima-courses/testimonials',
    logos: 'iima-courses/logos',
    home: 'iima-courses/home',
    general: 'iima-courses'
  };

  const folder = folderMap[type] || 'iima-courses';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('api_key', '898784168144989');

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Return the secure URL of uploaded image
    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {FileList} files - Multiple image files
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};
