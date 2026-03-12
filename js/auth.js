const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

/* =========================
   SIGNUP
========================= */
router.post("/signup", async (req, res) => {
  try {

    console.log("REQ BODY:", req.body);

    const { name, dob, phone, email, password } = req.body;

    if (!name || !dob || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO users (name, dob, phone, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email`,
      [name, dob, phone, email, password]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {

    console.error("Signup error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success:false,
        message:"Email and password required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    if(result.rows.length === 0){
      return res.status(401).json({
        success:false,
        message:"User not found"
      });
    }

    const user = result.rows[0];

    if(user.password !== password){
      return res.status(401).json({
        success:false,
        message:"Wrong password"
      });
    }

    res.json({
      success:true,
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        wallet_balance:user.wallet_balance
      }
    });

  } catch(error){

    console.error("Login error:", error);

    res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }

});

module.exports = router;