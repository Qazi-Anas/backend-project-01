import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true
    },
    tumbnail: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: string,
        required: true
    },
    description: {
        type: string,
        required: true
    },
    duration: {
        type: Number,
    },
    views: {
        type: number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
},{timestamps: true})


videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema)