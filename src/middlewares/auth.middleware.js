import { User } from "../models/user.model.js"
import { asynchandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const verifyJWT = asynchandler( async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("Access Token from cookies: ", token)
        if (!token){
            throw new ApiError(401, "Unauthorize request")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("decodeToken Username: ", decodeToken.username)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
        console.log("User fullname: ", user)
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid Access token you are already logout")
    }
})

export { verifyJWT }