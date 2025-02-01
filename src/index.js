import dotenv from "dotenv";
import databaseConnection from "./db/index.js";

dotenv.config({
    path:"./env"
});

databaseConnection();