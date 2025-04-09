require("dotenv").config();
const express = require('express');
const app = express();
const cors=require("cors");
const db = require('./db');  
const logoutRoute=require("./routes/logoutRoute.js")

app.use(cors({
  origin:process.env.FRONTEND_URL, 
  credentials:true,
}));
app.options('*', cors({
  origin:process.env.FRONTEND_URL,
  credentials: true,
}));


const cookieparser=require("cookie-parser");
const {checkForAuthentication}=require("./middlewares/auth.js");



const { setupDatabase } = require('./db');

(async () => {
  try {
    await setupDatabase();
    console.log('Database and tables created successfully!');
    
  } catch (error) {
    console.error('Error setting up database and tables:', error);
    process.exit(1);
  }
})();




//mongodb connection
const {connectMongoDb}=require("./connection");
connectMongoDb(process.env.MONGO_URL);


//routes
const productsRoute=require("./routes/products");
const salesRoute=require("./routes/sales");
const financial_reportsRoute=require("./routes/financial_reports");
const customer_trendsRoute=require("./routes/customer_trends");
const userRoute=require("./routes/user.js")
const cookieRoute=require("./routes/cookies.js")

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser());
app.use(checkForAuthentication);
app.use(express.static("public"));
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
});



app.use("/",logoutRoute);
app.use("/user",userRoute);
app.use("/api/products",productsRoute);
app.use("/api/sales",salesRoute);
app.use("/api/financial_reports",financial_reportsRoute);
app.use("/api/customer_trends",customer_trendsRoute);
app.use("/post/products",productsRoute);
app.use("/post/customer_trends",customer_trendsRoute);
app.use("/post/financial_reports",financial_reportsRoute);
app.use("/post/sales",salesRoute);
app.use("/test",cookieRoute);






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});