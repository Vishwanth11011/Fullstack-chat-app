import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import fileUpload from "express-fileupload";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {app,server} from "./lib/socket.js"
import bodyParser from "body-parser";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
// app.options('*', cors());
//app.use(bodyParser.urlencoded({ extended: true, parameterLimit: '100000', limit:"25mb" })); // URL-encoded limit

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'http://localhost:5173' || origin === 'https://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
      console.log("error in CORS");
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: '/tmp/', // required if you want to use tempFilePath for Cloudinary upload
//   limits: { fileSize: 10 * 1024 * 1024 },
// }));


// app.use(bodyParser.json({ limit: '10mb' })); // JSON limit → keep small

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT,()=>{
    console.log("server is running on port:" + PORT);
    console.log(process.env.MONGODB_URI);
    connectDB();
});