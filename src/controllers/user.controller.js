import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

//Generate Access And Refresh Token

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asynchandler( async (req, res) => {
    //get user details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email: ", email);

    //validation -not empty
    //Method 01
    /*if (fullName === ""){
        throw new ApiError(400, "fullName is required")
    }
    if (email === ""){
        throw new ApiError(400, "Email is required")
    }
    if (username === ""){
        throw new ApiError(400, "Username is required")
    }
    if (password === ""){
        throw new ApiError(400, "Password is required")
    }
        */
    //Method 02
    if([fullName, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    //Check for user exists or not

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser) {
        throw new ApiError(409, "User with email or Username already Exists")
    }

    //Check for Image, check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;   // multer to upload avatar file on local disc
    
    if(!avatarLocalPath){  //check if multer uploaded avatar or not
        throw new ApiError(400, "Avatar field is required") 
    }

    let coverImageLocalPAth;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPAth = req.files.coverImage[0].path
    }

    //Upload them on cloudinary -avatar

    const avatar = await uploadOnCloudinary(avatarLocalPath); //upload avatar from local disc to coludinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPAth);

    if (!avatar){  //check if avatar is successfully uploaded on cloudinary or not
        throw new ApiError(400, "Avatar field is required")
    }

    //Create user object -create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

    })

    // Check if User is created or not
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    // Return user if success
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asynchandler( async (req, res) => {
    //get data from req.body
    const {username, email, password} = req.body
    
    //check if username or email exists
    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    //get data for that particular user from database
    const user = await User.findOne({
        $or: [{ email },{ username }]
    })
    
    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    //check password 
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }

    //Now access Token and Refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    //Another database call to get update user document containing refresh token
    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    //secure cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {},
            "User logged In Successfully"
        )
    )
}) 

//Logout system

const logoutUser = asynchandler(async(req, res) => {
    console.log("id comes from middleware: ", req.user._id)
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    console.log("Updated Document: ", updatedUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

/*Simple Method*/
/* const registerUser = async (req, res) => {
    try{
        res.status(200).json({
            message: 'Chai Aur Code'
        })
    }catch(error){
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/
export { registerUser, loginUser, logoutUser}