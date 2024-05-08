import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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
    // async is to await file uploads during registeration of a user
    //res.status(200).json({ message: "ok" }); // testing of "/register" route
    // one function can send only 1 response
    // if we send response here, only that response will be sent

    // GET user data from Frontend(using form)
    const { fullName, username, email, password } = req.body; // how to get data from radio button (for gender)

    console.log("req.body\n",req.body);

    res.status(200).json({ message: "ok" }); // testing of "/register" route

    if(fullName === "" || username === "" || email === "" || password === "") {
        throw new ApiError(400, "All fields are required");
    }


    const exsistingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(exsistingUser) {
        throw new ApiError(409, "username or email already exists");
    }

    /*
        - below is a simpler but more expensive operation

        if(await User.findOne({ username })) {
            throw new ApiError(409, "username already exists");
        }
        else if(await User.findOne({ email })) {
            throw new ApiError(409, "email already exists");
        }
    */

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


const loginUser = asyncHandler(async(req, res) => {
    /*
        1. req.body -> data
        2. find whether user/email exists
        3. check password
        4. if password matches, generate access token and refresh token and provide to the user
        5. send these tokens through (secure) cookies
        -> these tokens are saved in cookies in the browser so that the user does not have
        to enter password everytime they login
    */

    const { usernameOrEmail, strPassword } = req.body;

    console.log("req.body for login\n", req.body);

    // let user = await User.findOne({username: usernameOrEmail});
    // if(!user) {
    //     user = await User.findOne({email: usernameOrEmail});
    //     if(!user) {
    //         throw new ApiError(400, "no username or email found");
    //     }
    // }

    let user = await User.findOne({
        $or: [{ usernameOrEmail }, { strPassword }]
    });

    if(!user) {
        throw new ApiError(404, "user not found");
    }

    // console.log("User:", user);

    if(!await user.isPasswordCorrect(strPassword)) {
        throw new ApiError(400, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id); // can't we directly pass the user document here?

    // remove password before sending
    const loggedInUser = User.findById(user._id).select("-password -refreshToken"); // user.select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };
    // this blocks the client from modifying cookies, only server will be able to modify the cookies

    res.status(200)
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

    return res.status(200)
    .clearCookie("accessToken", accessToken)
    .clearCookie("refreshToken", refreshToken)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, loginUser, logoutUser };

/*
    username => req.body
    User.findOne({}) // how do i find user, there is no form at logout
    
    sol.

    First of all, we need to check whether a user is logged in or not,
    to be able to logout the user.

    --> 2 options currently available:
    1. verify the user in logout function
    2. verify the user in a seperate middleware

    The 2nd option is best for our use case as we will need to verify the user at a lot of places,
    For eg. when a user likes, comments, subscribes etc. wherever the user tries to show
    their identity.

*/

