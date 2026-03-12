const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const adminRoutes = require("./routes/admin");

const { pool, initializeDatabase } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","PATCH","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", async (req, res) => {

  try {

    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "API running"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Database unavailable"
    });

  }

});


/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api", walletRoutes);
app.use("/api", adminRoutes);


/* =========================
   STATIC FRONTEND
========================= */

app.use(express.static(path.join(__dirname, "..")));


/* =========================
   ROOT PAGE
========================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});


/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


/* =========================
   START SERVER
========================= */

async function startServer(){

  try{

    await initializeDatabase();

    app.listen(PORT, () => {

      console.log("=================================");
      console.log("🚀 Fidelity Backend Started");
      console.log(`🌐 Server running on http://localhost:${PORT}`);
      console.log("=================================");

    });

  }catch(error){

    console.error("❌ Failed to start server:", error);
    process.exit(1);

  }

}

startServer();