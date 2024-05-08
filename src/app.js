import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // access and use user cookies

const app = express();

// access only to allowed domains
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// our app accepts json files, here we don't need to use body-parser(as it is no longer required)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public")); // public is a folder name which provides static data
app.use(cookieParser()); // this allows access of cookies to req and res

// import routes
import userRouter from "./routes/user.routes.js";

// we need to use middleware to use routes

// defining a prefix
// all the controllers(register, login, etc) regarding users will be defined here
app.use("/api/v1/users", userRouter);


export { app }