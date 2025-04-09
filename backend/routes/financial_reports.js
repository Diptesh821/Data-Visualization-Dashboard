const express = require('express');
const router = express.Router();
const { parse:parseDate } = require('date-fns');
const fs = require('fs');
const { parse:parseCSV } = require('fast-csv');
const db = require('../db');
const upload=require("../multer");
const axios = require('axios');

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
    if(!req.user){
      return res.status(401).json({ error: "User not logged in" });
   }
    const mongoUserId = req.user._id;
    const result = await db.query(
          `SELECT * FROM financial_reports WHERE mongo_user_id = $1 ORDER BY report_date DESC `,
          [mongoUserId.toString()]
        );
   
    const formattedReports = result.rows.map(report => ({
        ...report,
        report_date: report.report_date.toISOString().split('T')[0]
      }));
      res.json(formattedReports);
     
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    res.status(500).send('Server error');
  }
});



router.post('/',upload.single("financial_reports_csv"),async(req,res)=>{
  try {
    if(!req.user){
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
  

      try {
        
        for (const row of parsedRows) {
          const report_date = parseDate(row.report_date, 'dd-MM-yyyy', new Date());
          if (isNaN(report_date)) {
            console.error('Invalid sale date for row:', row);
            continue;
          }
          const revenue = parseFloat(row.revenue);
          const expenses = parseFloat(row.expenses);
          const net_profit = parseFloat(row.net_profit);
    
          
          if (!report_date|| !revenue || !expenses || !net_profit||!mongoUserId||!businessName) {
            console.error('Missing required product field:', row);
            continue; // Skip this row or handle the error as needed
          }
          // Insert into financial_reports table 
          await db.query(
            'INSERT INTO financial_reports (report_date, revenue, expenses, net_profit,mongo_user_id,business_name) VALUES ($1, $2, $3, $4,$5,$6)',
            [report_date, revenue, expenses, net_profit,mongoUserId,businessName]
          );
        }
        return res.json({ message: "File processed and data inserted" });
      } catch (dbError) {
        console.error("Database insertion error:", dbError);
        return res.status(500).json({ error: "Error inserting data into the database" });
      }
    
    
 
  }
  catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Server error" });
    }
})

module.exports=router;