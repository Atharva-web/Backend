import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true,
        index: true
    },
    description: String,
    thumbnail: {
        type: String, // url stored in cloudinary
        required: true
    },
    videoFile: {
        type: String, // url stored in cloudinary
        required: true,
        unique: true
    },
    duration: {
        type: Number, // information received from cloudinary
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true,
        required: true
    },
    views: {
        type: Number,
        default: 0,
        required: true
    }



}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const video = model("Video", videoSchema);