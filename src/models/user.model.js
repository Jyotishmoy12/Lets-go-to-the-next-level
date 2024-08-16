// Import necessary modules
import mongoose, { Schema } from "mongoose"; // MongoDB ODM for Node.js
import jwt from "jsonwebtoken"; // Module for creating and verifying JSON Web Tokens
import bcrypt from "bcrypt"; // Library for hashing passwords

// Define the user schema
const userSchema = new Schema({
    username: {
        type: String, // Username is a string
        required: true, // Username is required
        unique: true, // Username must be unique
        lowercase: true, // Convert username to lowercase
        trim: true, // Remove whitespace from both ends
        index: true // Create an index for this field for faster queries
    },
    email: {
        type: String, // Email is a string
        required: true, // Email is required
        unique: true, // Email must be unique
        lowercase: true, // Convert email to lowercase
        trim: true, // Remove whitespace from both ends
    },
    fullName: {
        type: String, // Full name is a string
        required: true, // Full name is required
        trim: true, // Remove whitespace from both ends
        index: true // Create an index for this field for faster queries
    },
    avatar: {
        type: String, // Avatar is a string (cloudinary URL)
        required: true, // Avatar is required
    },
    coverImage: {
        type: String, // Cover image is a string (probably also a URL)
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId, // Array of ObjectIds
            ref: "Video" // References the Video model
        }
    ],
    password: {
        type: String, // Password is a string
        required: [true, 'Password is required'] // Password is required with a custom error message
    },
    refreshToken: {
        type: String // Refresh token is a string
    },
},
{
    timestamps: true // Automatically add createdAt and updatedAt fields
})

// Middleware to hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); // Only hash if password is modified

    this.password = await bcrypt.hash(this.password, 10); // Hash password with salt rounds of 10
    next()
})

// Custom method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password) // Compare provided password with stored hash
}

// Custom method to generate an access token
userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Custom method to generate a refresh token
userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )    
}

// Create and export the User model
export const User = mongoose.model("User", userSchema);



/*Purpose:

Access Token: Used to authenticate and authorize a user for accessing protected resources or APIs.
Refresh Token: Used to obtain a new access token when the current one expires, without requiring the user to log in again.


Lifespan:

Access Token: Usually short-lived (minutes to hours) to minimize the security risk if intercepted.
Refresh Token: Typically long-lived (days to weeks) as it's used to maintain the user's session over an extended period.


Storage:

Access Token: Often stored in memory or short-term storage (e.g., localStorage) on the client-side.
Refresh Token: Should be stored securely, often in an HTTP-only cookie or secure storage on the client-side.


Usage frequency:

Access Token: Used with every authenticated request to the server.
Refresh Token: Used only when the access token expires and a new one is needed.


Payload:

Access Token: Contains user identification and authorization information.
Refresh Token: Usually contains minimal information, often just a unique identifier.


Security implications:

Access Token: If compromised, gives access to protected resources, but for a limited time.
Refresh Token: If compromised, could allow an attacker to obtain new access tokens indefinitely. Thus, it requires more secure handling.


Revocation:

Access Token: Difficult to revoke before expiration without maintaining a blacklist.
Refresh Token: Can be revoked on the server-side, effectively terminating the user's session.
*/