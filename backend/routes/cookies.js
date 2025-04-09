
const express=require("express");
const router=express.Router();


/*  /test/set-cookie   */
router.get("/set-cookie", (req, res) => {
    res.cookie("test_cookie", "test_value", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 1000, 
    });
    res.json({ message: "Test cookie set" });
  });


// 2. Checks if the test cookie is present
/*  /test/check-cookie   */
  router.get("/check-cookie", (req, res) => {
    const cookieValue = req.cookies.test_cookie;
    if (!cookieValue) {
      // Cookie is missing => either blocked or not set
      return res.json({ hasCookie: false });
    }
    // Cookie is present
    res.json({ hasCookie: true });
  });

module.exports=router;