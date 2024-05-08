import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken =  refreshToken;
        
        user.save({ validateBeforeSave: false }); // any updation to "user", we have to save to database

        return { refreshToken, accessToken };
    }
    catch(error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}

const registerUser = asyncHandler(async(req, res) => {
    
    // GET user data from Frontend(using form)
    const { fullName, username, email, password } = req.body; // how to get data from radio button (for gender)

    console.log("req.body\n",req.body);

    if(fullName === "" || username === "" || email === "" || password === "") {
        throw new ApiError(400, "All fields are required");
    }

    const exsistingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(exsistingUser) {
        throw new ApiError(409, "username or email already exists");
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

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user:", createdUser.username);
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
});


const loginUser = asyncHandler(async(req, res) => {
    const { usernameOrEmail, strPassword } = req.body;

    // console.log("req.body for login\n", req.body);

    // let user = await User.findOne({
    //     $or: [{ username: usernameOrEmail }, { password: strPassword }]
    // });

    let user = await User.findOne({username: usernameOrEmail});
    if(!user) {
        user = await User.findOne({email: usernameOrEmail});
        if(!user) {
            throw new ApiError(400, "no username or email found");
        }
    }

    // console.log("user document: ", user);

    if(!user) {
        throw new ApiError(404, "user not found");
    }

    if(!await user.isPasswordCorrect(strPassword)) {
        throw new ApiError(400, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id); // can't we directly pass the user document here?

    // remove password before sending
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // user.select("-password -refreshToken");

    // before sending the cookies, we need to block the client from modifying it
    // only server should be able to modify cookies
    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    );
});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    // const { accessToken, refreshToken } = await generateAccessAndRefreshToken(req.user._id);
    // not required to generate any tokens during logout

    return res.status(200)
    .clearCookie("accessToken", options) // don't we need access and refresh tokens here?
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if(!user) {
        throw new ApiError(404, "Invalid Refresh Token");
    }

    if(incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(404, "Refresh Token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    };

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Access Token and Refresh Token refreshed"
        )
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };