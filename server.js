const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files from the public directory.
app.use(express.static(path.join(__dirname, "public")));

// Health-check endpoint for operational testing.
app.get("/health", (req, res) => {
    res.status(200).json({
        application: "DevOps Adventure",
        status: "UP",
        runtime: "Node.js",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("--------------------------------");
    console.log("DevOps Adventure Started");
    console.log(`Server running on port ${PORT}`);
    console.log("--------------------------------");
});
