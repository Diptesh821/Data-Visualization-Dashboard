const express=require("express"); 
const router=express.Router();
const {handleNewUser,handleLoginUser,getUserDetail}=require("../controllers/user.js");
router.route("/").post(handleNewUser);
router.post("/login",handleLoginUser);
router.get("/get",getUserDetail);
module.exports=router;