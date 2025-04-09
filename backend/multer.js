const multer = require("multer");
const path = require("path");
const fs = require("fs");

if (process.env.NODE_ENV === "production") {
  // Production: Use Cloudinary for storage
  const { v2: cloudinary } = require("cloudinary");
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  // Configure Cloudinary using environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure CloudinaryStorage with dynamic folder settings based on fieldname
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      let subfolder = "";
      switch (file.fieldname) {
        case "sales_csv":
          subfolder = "sales";
          break;
        case "financial_reports_csv":
          subfolder = "financial_reports";
          break;
        case "customer_trends_csv":
          subfolder = "customer_trends";
          break;
        case "products_csv":
          subfolder = "products";
          break;
        default:
          subfolder = "others";
      }
      return {
        folder: `uploads/${subfolder}`,    // Files stored in folder 'uploads/{subfolder}' in Cloudinary
        public_id: `${Date.now()}-${file.originalname}`,
        resource_type: "raw",                // Important for non-image files like CSV
      };
    },
  });

  const upload = multer({ storage });
  module.exports = upload;
} else {
  // Development: Store files locally in subfolders under ./uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let subfolder = "";
      switch (file.fieldname) {
        case "sales_csv":
          subfolder = "sales";
          break;
        case "financial_reports_csv":
          subfolder = "financial_reports";
          break;
        case "customer_trends_csv":
          subfolder = "customer_trends";
          break;
        case "products_csv":
          subfolder = "products";
          break;
        default:
          subfolder = "";
      }
      const uploadPath = path.join(__dirname, "uploads", subfolder);
      // Check if the folder exists; if not, create it recursively
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  const upload = multer({ storage });
  module.exports = upload;
}
