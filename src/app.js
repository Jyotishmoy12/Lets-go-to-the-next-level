import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// how much json we want to accept to stop preventing the server from crashing
app.use(express.json({limit:"10kb"}))

// url configuration 
app.use(express.urlencoded({ extended: true, limit:"10kb" }));

// storing all the assets in public folder
app.use(express.static("public"))

app.use(cookieParser())

//Routes

import userRouter from "./routes/user.routes.js"


//routes declaration
// if a user types /users then the control will transfer to userRouter
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users
export {app}