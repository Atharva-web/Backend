import mongoose from "mongoose";
import express from "express";

import { DB_NAME }from './constants.js';

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERROR: unable to talk to mongodb");
            throw error;
        })

        app.listen(process.env.PORT, () => console.log(`app is listening on PORT: ${process.env.PORT}`))
    }
    catch(error) {
        console.log("ERROR: ", error);
        throw error;
    }
})();

