import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user; // now our logout function in user controller has access to the user
    
        next(); // my work here is done, pass the control to next middleware or method in the route
    }
    catch (error) {
        throw new ApiError(401, error.message || "Invalid Access Token"); // error?.message
    }
});

export { verifyJWT };

// req.cookie is conditional because user may send a custom header
// in such case, we can use req.header to extract the header information

