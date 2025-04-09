const express = require('express');
const router = express.Router();
const { parse: parseDate } = require('date-fns');
const fs = require('fs');
const { parse: parseCSV } = require('fast-csv');
const axios = require('axios'); 
const db = require('../db');
const upload = require("../multer");

const isProduction = process.env.NODE_ENV === "production";

// Helper function to process CSV from a Cloudinary URL
async function processCloudinaryFile(cloudinaryUrl) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      url: cloudinaryUrl,
      responseType: 'stream'
    })
      .then(response => {
        const results = [];
        response.data
          .pipe(parseCSV({ headers: true, trim: true }))
          .on('data', (row) => results.push(row))
          .on('end', () => {
            console.log('Cloudinary CSV parsed successfully.');
            resolve(results);
          })
          .on('error', (err) => {
            reject(err);
          });
      })
      .catch(err => reject(err));
  });
}

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not logged in" });
    }
    const mongoUserId = req.user._id;
    const result1 = await db.query(
      `SELECT * FROM sales WHERE mongo_user_id = $1 ORDER BY sale_date DESC`,
      [mongoUserId.toString()]
    );

    const sales = result1.rows.map(report => ({
      ...report,
      sale_date: report.sale_date.toISOString().split('T')[0]
    }));
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).send('Server error');
  }
});

router.post('/', upload.single("sales_csv"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not logged in" });
    }
    const mongoUserId = req.user._id;
    const businessName = req.body.business_name;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let parsedRows = [];

    if (isProduction) {
      // In production, req.file.path is a Cloudinary URL—use axios streaming
      parsedRows = await processCloudinaryFile(req.file.path);
    } else {
      // In development, use fs.createReadStream on the local file
      parsedRows = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(req.file.path)
          .pipe(parseCSV({ headers: true, trim: true }))
          .on('data', (data) => results.push(data))
          .on('end', () => {
            console.log('Local CSV parsed successfully.');
            resolve(results);
          })
          .on('error', (err) => reject(err));
      });
    }

    // Loop through each parsed row and insert into the sales table
    for (const row of parsedRows) {
      const sale_date = parseDate(row.sale_date, 'dd-MM-yyyy', new Date());
      if (isNaN(sale_date)) {
        console.error('Invalid sale date for row:', row);
        continue;
      }

      const quantity = parseInt(row.quantity, 10);
      const total_amount = parseFloat(row.total_amount);

      if (!sale_date || !quantity || !total_amount || !mongoUserId || !businessName) {
        console.error('Missing required field in row:', row);
        continue;
      }

      await db.query(
        'INSERT INTO sales (sale_date, quantity, total_amount, mongo_user_id, business_name) VALUES ($1, $2, $3, $4, $5)',
        [sale_date, quantity, total_amount, mongoUserId, businessName]
      );
    }

    return res.json({ message: "File processed and data inserted" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
