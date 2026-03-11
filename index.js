import "dotenv/config"
import express from "express"
import mongoose from "mongoose"

const app = express()
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI

app.use(express.json())

app.get("/", (_req, res) => {
    res.json({ message: "Lab request backend is running" })
})

const startServer = async () => {
    if (!mongoUri) {
        console.error("MONGODB_URI is not set")
        process.exit(1)
    }

    try {
        await mongoose.connect(mongoUri)
        console.log("MongoDB connected")

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
    } catch (error) {
        console.error("MongoDB connection failed", error)
        process.exit(1)
    }
}

startServer()
