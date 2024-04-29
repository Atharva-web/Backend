import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // access and use user cookies

const app = express();

// access only to allowed domains
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// our app accepts json files, here we don't need to use body-parser
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public")); // public is a folder name which provides static data
app.use(cookieParser());

export { app }