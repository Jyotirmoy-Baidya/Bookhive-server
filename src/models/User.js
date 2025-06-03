import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    user_name: {
        type: String,
        required: true,
        trim: true,
    },
    password:{
        type:String,
        required:true
    },
    preferences_tags: {
        type: [String],
        default: [],
    },
    books_read: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true // optional: adds createdAt and updatedAt
});

const User = mongoose.model("User", userSchema);

export default User;
