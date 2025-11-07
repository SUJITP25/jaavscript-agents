import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})
const app = express();
app.use(express.json())

const database_url = process.env.database_url
const port = process.env.port


const connectDB = async () => {
    await mongoose.connect(database_url)
        .then(() => {
            console.log("MongoDB connected successfully");
            app.listen((port), () => {
                console.log(`Server is Running on http://localhost:${port}`)
            })
        }).catch((err) => {
            console.log(err.message);
            process.exit(1);
        })
}


