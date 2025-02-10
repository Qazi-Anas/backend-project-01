import dotenv from "dotenv";
import databaseConnection from "./db/index.js";
import app from './app.js'

dotenv.config({
    path:"./env"
});

databaseConnection()
.then(() => {
    app.on("App does not responding", (error) => {
        console.log("Error App does not Connect to database", error)
        throw error
    })
    app.listen(process.env.PORT || 3000, () => {
        console.log(`App is listen to Port: ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log(`MongoDB Connection Failed !!! ${err}`)
})