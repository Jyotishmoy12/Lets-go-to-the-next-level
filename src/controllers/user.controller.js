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
   // Extract user details from the request body
   const {fullName, email, username, password}=req.body;
   console.log("email", email)
   // 2nd step
//    if(fullName==""){
//     throw new ApiError(400, "Fullname is required")
//    }
    // Validate that all required fields are provided and not empty
    //trim() is a string method that removes whitespace from both ends of a string.
    if(
        [fullName, email, username, password].some((field)=>
            field?.trim()=="")
        )
    {
      throw new ApiError(400, "All fields are compulsory")  
    }

    // 3 rd step
    // returns the user if we are able to find one
    // Check if a user with the same username or email already exists
    /*
This $or operator is performing a logical OR operation in the database query. Here's what it does:

It tells MongoDB to find documents that match at least one of the conditions specified in the array.
In this case, there are two conditions:

{ username }: This is shorthand for { username: username }, where the right-side username is the variable from your code containing the user's input.
{ email }: Similarly, this is shorthand for { email: email }.


So, the query is essentially asking the database:
"Find a user document where EITHER the username matches the provided username OR the email matches the provided email."
If either condition is true (i.e., if there's a user with the given username OR a user with the given email), the query will return that user document.

This $or query is used to check if a user already exists with either the provided username or the provided email. It's an efficient way to check both conditions in a single database query, rather than making separate queries for username and email.
    */
   const existedUser=await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if(existedUser){
       throw new ApiError(409, "User with email or username already exist") 
    }
   
    // 4 th step
    // Get the local path of the uploaded avatar and cover image files
     const avatarLocalPath=req.files?.avatar[0]?.path;
     //const coverImageLocalPath=req.files?.coverImage[0]?.path

     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
     }

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
   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )
})

export {registerUser}