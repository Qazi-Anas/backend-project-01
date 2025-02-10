import express from 'express';
import cookieParser from 'cookie-parser';

const app = express()

app.use(express.json({limit: "16kb"}))   // Middleware for parsing json objects
app.use(express.urlencoded({extended: true}))  //middleware for parsing URL
app.use(express.static("public"))  //Middleware for storing temp files
app.use(cookieParser())

import userRouter from "./routs/user.routes.js"

app.use("/api/v1/users", userRouter) 

export default app 