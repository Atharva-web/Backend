import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) => {
    // async is to await file uploads during registeration of a user
    //res.status(200).json({ message: "ok" }); // testing of "/register" route
    // one function can send only 1 response
    // if we send response here, only that response will be sent

    // GET user data from Frontend(using form)
    const { fullName, username, email, password } = req.body; // how to get data from radio button (for gender)

    if(fullName === "" || username === "" || email === "" || password === "") {
        throw new ApiError(400, "All fields are required");
    }

    // User.findOne({ username }); // shorthand for { username: username }. find a key "username" in the database which has value that is stored in the variable "username"

    // const exsistingUser = User.findOne({
    //     $or: [{ username }, { email }]
    // });
    // if(exsistingUser) throw new ApiError(409, "username or email already exists");
    
    if(await User.findOne({ username })) {
        throw new ApiError(409, "username already exists");
    }
    else if(await User.findOne({ email })) {
        throw new ApiError(409, "email already exists");
    }

    // if avatar and cover images are uploaded by the user, then upload them to cloudinary

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("Avatar Local Path:", avatarLocalPath);
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    
    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    if(!avatarResponse) {
        throw new ApiError(500, "Something went wrong while uploading avatar to cloudinary");
    }

    // const converImageLocalPath = req.files?.coverImage[0]?.path;

    let converImageLocalPath = "";
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        converImageLocalPath = req.files.coverImage[0].path;
    }

    const coverImageResponse = await uploadOnCloudinary(converImageLocalPath);

    // CREATE user
    const newUser = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatarResponse.url,
        coverImage: coverImageResponse?.url || ""
    });

    // extra db call, but is a fool-proof method
    // 1. checking whether newUser has been created
    // 2. removing password and refreshToken from the document
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user:", createdUser.username);
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
});

export { registerUser };