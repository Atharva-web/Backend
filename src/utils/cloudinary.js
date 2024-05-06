import fs from "fs";
import dotenv from "dotenv";

import { v2 as cloudinary } from 'cloudinary';
dotenv.config({
    path: "../.env"
});

// cloud configuration

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // upload file to cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            { resource_type: "auto" }
        );
        // file will be uploaded successfully

        console.log(`File is uploaded on cloudinary at ${response.url}`);

        return response;
    }
    catch(error) {
        console.log("Error uploading files to cloudinary", error.message);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary };

/*
    First we store a file in local system temporarily
    then from local system we transfer it to the "Cloudinary" service
    then we remove the file from our local system

    if an error occurs, that may be due to a corrupted file,
    or let's say we only allow files upto 100 MB,
    if user tries to upload a file of 150 MB, even if our local system can afford to keep the file,
    we wouldn't want to store such big files on our cloud ("Cloudinary")
    in such case, we will remove the file from local system too
*/