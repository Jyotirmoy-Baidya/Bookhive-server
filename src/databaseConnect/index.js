
import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_DATABASE_URL);
        console.log("Db connected successfully");
    }
    catch (error) {
        console.log("Db connection failed\n", error);
    }
}

export default dbConnect;