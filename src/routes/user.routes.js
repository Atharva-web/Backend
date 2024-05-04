import { Router } from "express";

import { registerUser }  from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
// adding a middleware here because we cannot handle files from req.body
// middleware adds additional fields/data to req.body

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

export default router;
/*
    here we have done a default export because
    there will be several route names
*/

