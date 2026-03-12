const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

/*
GET WALLET BALANCE + TRANSACTIONS
*/
router.get("/wallet", authMiddleware, async (req, res) => {
  try {

    const userId = req.user.userId;

    const user = await pool.query(
      "SELECT wallet_balance FROM users WHERE id=$1",
      [userId]
    );

    const tx = await pool.query(
      "SELECT type,amount,created_at FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [userId]
    );

    res.json({
      success: true,
      balance: user.rows[0].wallet_balance,
      transactions: tx.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false });
  }
});

/*
DEPOSIT REQUEST
*/
router.post("/deposit", authMiddleware, async (req,res)=>{

  try{

    const userId=req.user.userId;
    const {amount}=req.body;

    await pool.query(
      "INSERT INTO deposit_requests(user_id,amount,type) VALUES($1,$2,$3)",
      [userId,amount,"manual"]
    );

    res.json({
      success:true,
      message:"Deposit request created"
    });

  }catch(err){
    console.error(err);
    res.status(500).json({success:false});
  }

});


/*
WITHDRAW REQUEST
*/
router.post("/withdraw", authMiddleware, async (req,res)=>{

  try{

    const userId=req.user.userId;
    const {amount}=req.body;

    const user=await pool.query(
      "SELECT wallet_balance FROM users WHERE id=$1",
      [userId]
    );

    if(user.rows[0].wallet_balance < amount){
      return res.status(400).json({
        success:false,
        message:"Insufficient balance"
      });
    }

    await pool.query(
      "INSERT INTO withdraw_requests(user_id,amount,upi) VALUES($1,$2,$3)",
      [userId,amount,"UPI"]
    );

    res.json({
      success:true,
      message:"Withdraw request submitted"
    });

  }catch(err){
    console.error(err);
    res.status(500).json({success:false});
  }

});

module.exports = router;