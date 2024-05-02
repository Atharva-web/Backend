// require("dotenv").config({path: "./env"});

import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "../.env"
});


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
