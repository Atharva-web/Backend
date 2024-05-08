import { Router } from "express";

import { registerUser, loginUser, logoutUser, refreshAccessToken }  from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// adding a middleware here because we cannot handle files from req.body
// middleware adds additional fields/data to req.body
// form ka data to jaa raha hai, lekin images ko bhi leke jaao sath mein

const router = Router();

// router.route("/register").post(upload.fields([{}, {}]), registerUser);

router.route("/register")
.post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);

router.route("/login").post(loginUser);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
/*
    here we have done a default export because
    there will be several route names
*/

