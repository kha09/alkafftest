// lib/volumePath.js
export const VOLUME_PATH = 
  process.env.RAILWAY_VOLUME_MOUNT_PATH || 
  process.env.FILE_STORAGE_PATH || 
  "/uploads";
