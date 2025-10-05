import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "canteen_menu",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 300, height: 300, crop: "fill" } // make it a square
    ],
  },
});

const parser = multer({ storage });

export default parser;
