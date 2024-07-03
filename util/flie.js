const fs = require("fs").promises;
const path = require("path");

const deleteFile = async (filepath) => {
  try {
    await fs.access(filepath, fs.constants.F_OK);
    await fs.unlink(filepath);
    console.log(`Successfully deleted file: ${filepath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`File not found, skipping delete: ${filepath}`);
    } else {
      console.error(`Error deleting file ${filepath}:`, error);
      throw error; // Re-throw the error if it's not a "file not found" error
    }
  }
};

module.exports = {
  deleteFile,
};
