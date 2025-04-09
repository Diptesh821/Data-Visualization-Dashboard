require("dotenv").config();
const USER=require("../models/user.js");
const bcrypt=require("bcrypt");
const {setUser}=require("../servers/auth.js")
const isProduction = process.env.NODE_ENV === "production";


async function handleNewUser(req,res) {
    const {name,email,password}=req.body;
    const user=await USER.findOne({email});
    if(user){
        return res.status(400).json({
            error: "User already exists. Please log in instead.",
          });
    }
   
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!passwordRegex.test(password)){
        return res.status(400).json({
            error:
              "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
          });
  
    }
    const saltrounds=10;
    const hashedpassword=await bcrypt.hash(password,saltrounds);
    if(name===process.env.ADMIN_NAME){
    await USER.create({
        
        name:name,
        email:email,
        password:hashedpassword,
        role:"ADMIN",
    })
}
    else{
    await USER.create({
        
        name:name,
        email:email,
        password:hashedpassword,
        role:"NORMAL",
    })
}

return res.status(201).json({
    message: "User created successfully!",
  });
}
async function handleLoginUser(req,res) {
    const {email,password}=req.body;
    const user=await USER.findOne({
        email
    });
    if(!user){
        return res.status(400).json({
            error: "Invalid email or password",
          });
           
        
        
    }
    const ismatch=await bcrypt.compare(password,user.password);
    if(!ismatch){
        return res.status(400).json({
            error: "Invalid email or password",
          });
    }
    const token=setUser(user);
    res.cookie("token", token, {
        httpOnly: true,
       secure: isProduction,
       sameSite: isProduction?"none":"lax",
        maxAge: 60*60 * 1000 
      });


   
    
    return res.status(201).json({
        message: "User logged in successfully",
        token:token,
      });

    
    
    
}




async function getUserDetail(req,res) {

    if(!req.user){
        return res.status(401).json({ error: "User not logged in" });
     }
    const {email}=req.user;
    const user=await USER.findOne({
        email
    });
    if(!user){
        return res.status(400).json({
            error: "user does not exists",
          });
           
        
        
    }
    

   
    
    return res.status(201).json({
        name: user.name,
        email:user.email,
        role:user.role,
      });

    
    
    
}
module.exports={
    handleNewUser,
    handleLoginUser,
    getUserDetail
}