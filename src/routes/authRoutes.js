const express = require("express");
const router = express.Router();
const authController= require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");



router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/check", authMiddleware, (req, res) => {
  res.status(200).json({ message: "User is logged in" });
});

module.exports = router;