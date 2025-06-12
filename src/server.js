import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import dbConnect from './databaseConnect/index.js'

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://koalacoderz.netlify.app/'],
    credentials: true
}))

//Connecting to database
dbConnect();

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

import authRouter from './routes/AuthRouter.js'
app.use("/api/v1/auth", authRouter);
import userRouter from './routes/UserRouter.js'
app.use("/api/v1/user", userRouter);
import userConnectionRouter from './routes/UserConnectionRoutes.js'
app.use("/api/v1/user-connection", userConnectionRouter);
import tagsRouter from './routes/TagsRouter.js'
app.use("/api/v1/tags", tagsRouter);
import bookRouter from './routes/BookRouter.js'
app.use("/api/v1/books", bookRouter);




// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
