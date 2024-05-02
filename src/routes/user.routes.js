import { Router } from "express";
import { registerUser }  from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

export default router;
/*
    here we have done a default export because
    there will be several route names
*/