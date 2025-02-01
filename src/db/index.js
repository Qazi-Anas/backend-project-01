import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const databaseConnection = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Database Connected !! DB HOST: ${connectionInstance.connection.host}`);
    }catch(error)
    {
        console.error("MongoDB Connection Failed: ",error)
        process.exit(1)
    }
}

export default databaseConnection