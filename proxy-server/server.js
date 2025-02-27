const express = require("express")
const cors = require("cors")
const axios = require("axios")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")

// Load environment variables
dotenv.config()

const app = express()
app.use(cors());

const PORT = process.env.PORT || 3000

// Middleware
app.use(cors()) // Enable CORS for all routes
app.use(bodyParser.json())

// DeepSeek API proxy endpoint
app.post("/api/deepseek", async (req, res) => {
  try {
    const apiKey = "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"

    const response = await axios.post("https://api.deepseek.com/v1/generate", req.body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    })

    res.json(response.data)
  } catch (error) {
    console.error("Error proxying to DeepSeek API:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "Failed to fetch data from DeepSeek API",
      details: error.response?.data || error.message,
    })
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is running")
})

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`)
})

