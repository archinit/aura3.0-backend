import mongoose, { Document, Schema } from "mongoose";

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    lastActive: Date;
}

const SessionSchema = new Schema<ISession>(
    {
        userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
        token: {type: String, required:true, unique: true},
        expiresAt: {type: Date, required:true,},
        lastActive: {type: Date, default: Date.now},
    },
    {
        timestamps: true
    }
);

SessionSchema.index({ expiresAt: 1}, {expireAfterSeconds: 0});

export const Session = mongoose.model<ISession>("Session", SessionSchema);