const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

/*
GET ALL USERS
*/
router.get("/admin/users", async (req,res)=>{

try{

const users = await pool.query(
"SELECT id,name,email,wallet_balance,credit_score,status FROM users ORDER BY id"
);

res.json({
success:true,
users:users.rows
});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});


/*
UPDATE USER WALLET BALANCE
*/
router.post("/admin/update-wallet", async (req,res)=>{

try{

const {userId,balance} = req.body;

await pool.query(
"UPDATE users SET wallet_balance=$1 WHERE id=$2",
[balance,userId]
);

res.json({
success:true,
message:"Wallet updated"
});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});


/*
ENABLE / DISABLE USER
*/
router.post("/admin/toggle-user", async (req,res)=>{

try{

const {userId,status} = req.body;

await pool.query(
"UPDATE users SET status=$1 WHERE id=$2",
[status,userId]
);

res.json({
success:true,
message:"User status updated"
});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});


/*
APPROVE DEPOSIT
*/
router.post("/admin/approve-deposit", async (req,res)=>{

try{

const {requestId,userId,amount} = req.body;

await pool.query(
"UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id=$2",
[amount,userId]
);

await pool.query(
"INSERT INTO transactions(user_id,type,amount,status) VALUES($1,$2,$3,$4)",
[userId,"deposit",amount,"approved"]
);

await pool.query(
"UPDATE deposit_requests SET status='approved' WHERE id=$1",
[requestId]
);

res.json({
success:true,
message:"Deposit approved"
});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});


/*
APPROVE WITHDRAW
*/
router.post("/admin/approve-withdraw", async (req,res)=>{

try{

const {requestId,userId,amount} = req.body;

await pool.query(
"UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id=$2",
[amount,userId]
);

await pool.query(
"INSERT INTO transactions(user_id,type,amount,status) VALUES($1,$2,$3,$4)",
[userId,"withdraw",amount,"approved"]
);

await pool.query(
"UPDATE withdraw_requests SET status='approved' WHERE id=$1",
[requestId]
);

res.json({
success:true,
message:"Withdraw approved"
});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});


/*
UPDATE STOCK PRICE
*/
router.post("/admin/update-stock", async (req,res)=>{

try{

const {stockId,price,change} = req.body;

await pool.query(
"UPDATE stocks SET price=$1,change_percent=$2,updated_at=NOW() WHERE id=$3",
[price,change,stockId]
);

res.json({
success:true,
message:"Stock updated"
});

}catch(err){
console.error(err);
res.status(500).json({success:false});
}

});

module.exports = router;