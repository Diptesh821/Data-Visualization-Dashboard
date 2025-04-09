const {getUser}=require("../servers/auth.js")
function checkForAuthentication(req,res,next){
    const tokenCOOKIE= req.cookies?.token; 
    req.user=null;

    if(!tokenCOOKIE)
    return next();

    const token =tokenCOOKIE;
    const user=getUser(token);
    req.user=user;
    return next(); 

}
module.exports={
  checkForAuthentication,
}