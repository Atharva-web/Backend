import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, // optimized for database search
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
        index: true
    },
    avatar: {
        type: String, // url stored in cloudinary service
        required: true,
        // default: ? // default image can also be stored in cloudinary
    },
    coverImage: {
        type: String // url stored in cloudinary service
    },
    watchHistory: [
            // An Id referring to "Video" Schema
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String, // stored using bcrypt middleware
        required: [true, "Password is required"]
    },

    refreshToken: {
        type: String
    }

}, { timestamps: true });


// {schema.pre} middleware(hook) is used to do something before an event
// use normal function here and not arrow function as
// "this" in arrow function is lexically scoped, that's why we use normal function
// "this" has access to all the fields of the schema

userSchema.pre("save", async function(next) {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next(); // call next to pass this flag forward --> continue the process
    }
    else {
        return next();
    }
});


// defining several methods to userSchema

userSchema.methods.isPasswordCorrect = async function(strPassword) {
    return await bcrypt.compare(strPassword, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const User = model("User", userSchema);