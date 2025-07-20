import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
    userId: string;
    type: string;
    name: string;
    description: string;
    duration: number;
    timestamp: Date;
}


const activitySchema = new Schema<IActivity>({
    userId: {
        type: String,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            "meditation",
            "exercise",
            "walking",
            "reading",
            "journaling",
            "therapy",
        ],
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    duration: {
        type: Number,
        min: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
},
{
    timestamps: true,
}
);


activitySchema.index({userId: 1, timestamp: -1});

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);