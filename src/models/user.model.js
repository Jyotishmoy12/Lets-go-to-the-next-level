import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, // cloudinary url
        required:true,
    },
    coverImage:{
        type:String,
    }
    ,
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, 'Password is required']
    },
    refreshToken:{
        type:String
    },
},
{
    timestamps:true
}
)
// data save hone se pehle password ko encrypt kar do amd it also Took some time
// that's why use async middleware ka flag
// password field ka modification jab bheju tab run kao is step ko
// not everytime do it example: password set, updatepassword
userSchema.pre("save", function(next){
    if(!this.isModified("password")) return next();

    this.password=bcrypt.hash(this.password, 10);
    next()
})

// custom methods

userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken=async function(){
   return await jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
    fullname:this.fullname,
   },
   process.env.ACCESS_TOKEN_SECRET,
   {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
   }
)
}
userSchema.methods.refreshToken=async function(){
    return await jwt.sign({
        _id:this._id,
       },
       process.env.REFRESH_TOKEN_SECRET,
       {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
       }
    )    
}


export const User=mongoose.model("User", userSchema);

