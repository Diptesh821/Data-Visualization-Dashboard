const express = require('express');
const router = express.Router();
const { parse:parseDate, add } = require('date-fns');
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


router.get('/',async(req,res)=>{
    try{
      if(!req.user){
        return res.status(401).json({ error: "User not logged in" });
     }
       const mongoUserId = req.user._id;
          const result1 = await db.query(
            `SELECT * FROM customer_trends WHERE mongo_user_id = $1 ORDER BY trend_date DESC`,
            [mongoUserId.toString()]
          );

        
        const customerTrends = result1.rows.map(report => ({
            ...report,
            trend_date: report.trend_date.toISOString().split('T')[0]
          }));
          res.json(customerTrends);
    }
    catch(error){
        console.error('Error fetching customer trends:', error);
        res.status(500).send('Server error');
    }
})


router.post('/',upload.single("customer_trends_csv"),async(req,res)=>{

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
            const trend_date = parseDate(row.trend_date, 'dd-MM-yyyy', new Date());
            if (isNaN(trend_date)) {
              console.error('Invalid sale date for row:', row);
              continue;
            }

            const customer_segment = row.customer_segment?row.customer_segment.trim():null;
            const metric_type = row.metric_type?row.metric_type.trim():null;
            const metric_value = parseFloat(row.metric_value);
            const additional_context=JSON.parse(row.additional_context);
           
            if (!trend_date|| !customer_segment || !metric_type || !metric_value||!additional_context||!mongoUserId||!businessName) {
              console.error('Missing required product field:', row);
              continue; // Skip this row or handle the error as needed
            }
            // Insert into customer_trends table 
            await db.query(
              'INSERT INTO customer_trends (trend_date, customer_segment, metric_type, metric_value,additional_context,mongo_user_id,business_name) VALUES ($1, $2, $3, $4, $5,$6,$7)',
              [trend_date, customer_segment, metric_type, metric_value,additional_context,mongoUserId,businessName]
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
