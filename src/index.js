// require("dotenv").config({path: "./env"});

import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "../.env"
});

// console.log("env variables loaded:", process.env.PORT);
// console.log("MONGO_DB_URI:", process.env.MONGODB_URI);
// console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
// console.log("REFRESH_TOKEN_EXPIRY", process.env.REFRESH_TOKEN_EXPIRY);
// console.log("CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY);

// console.log("env variables loaded:", process.env.PORT);

connectDB()
.then(() => {
    // app.on(error, (error) => {
    //     console.log("Error: ", error);
    // });
    
    app.listen(process.env.PORT || 3000, () => {
        console.log(`App listening at port ${ process.env.PORT } || 3000`);
    });
})
.catch((error) => {
    console.log("Error returning a promise by mongoose", error);
});
