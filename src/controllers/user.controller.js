import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser= asyncHandler(async(req, res)=>{
   //1) get user details from frontend
   // 2) validations (form validation type) not empty
   // 3)check if user is already exist using username and email both
   // 4)check for images, check for avatar
   // 5)upload them to cloudinary, avatar
   // 6)create user object - create entry in database
   // 7)remove password and refresh token filed from response
   // 8)check for user creation 
   // 9)return response


   // 1st step
   const {fullName, email, username, password}=req.body;
   console.log("email", email)
   // 2nd step
//    if(fullName==""){
//     throw new ApiError(400, "Fullname is required")
//    }
    if(
        [fullName, email, username, password].some((field)=>
            field?.trim()=="")
        )
    {
      throw new ApiError(400, "All fields are compulsory")  
    }

    // 3 rd step
    // returns the user if we are able to find one
   const existedUser=User.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if(existedUser){
       throw new ApiError(409, "User with email or username already exist") 
    }
   
    // 4 th step
     const avatarLocalPath=req.files?.avatar[0]?.path;
     const coverImageLocalPath=req.files?.coverImage[0]?.path

     if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
     }
     // 5 th step
     const avatar=await uploadOnCloudinary(avatarLocalPath)
     const coverImage=await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
        throw new ApiError(400, "Avatar file is required");
     }
     // entry in database
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase
    }) 

    // check if we are able to find a user using ._id(monggodb provide it)
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering a user")
   }
   return response.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )
})

export {registerUser}