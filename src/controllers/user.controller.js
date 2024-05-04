import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler(async(req, res) => {
    // async is to await file uploads during registeration of a user
    // res.status(200).json({ message: "ok" });

    // GET user data from Frontend(using form)
    const { fullName, username, email, password } = req.body;
    console.log("email: ", email);

    if(fullName === "" || username === "" || email === "" || password === "") {
        throw new ApiError(400, "All fields are required");
    }

    // User.findOne({ username }); // shorthand for { username: username }. find a key username in the database which has the value that is stored in the variable "username"

    // const exsistingUser = User.findOne({
    //     $or: [{ username }, { email }]
    // });
    // if(exsistingUser) throw new ApiError(409, "username or email already exists");
    
    if(User.findOne({ username })) {
        throw new ApiError(409, "username already exists");
    }
    else if(User.findOne({ email })) {
        throw new ApiError(409, "email already exists");
    }

    // if avatar and cover images exist, then upload them to cloudinary

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const converImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = await uploadOnCloudinary(converImageLocalPath);

    if(!avatarResponse) {
        throw new ApiError(400, "Avatar file is required");
    }


    // CREATE user
    const newUser = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatarResponse.url,
        coverImage: coverImageResponse?.url // || ""
    });

    // extra db call but is a fool-proof method
    // 1. checking whether newUser has been created
    // 2. removing password and refreshToken from the document
    const createdUser = await newUser.findById(newUser._id).select("-password -refreshToken");
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user: ", createdUser.username);
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
});

export { registerUser };