import { Server } from "socket.io";

let io;
const userSocketMap = {}; 

const initializeSocket = (server) => { // Only needs the server now
    io = new Server(server, { // Assign to the module-level io
        cors: {
            origin: (origin, callback) => {
                if (!origin || origin === 'http://localhost:5173' || origin === 'https://localhost:5173') {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        const userId = socket.handshake.query.userId;
        if (userId) userSocketMap[userId] = socket.id;

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

export { initializeSocket, io }; // Export io separately now 

// import {Server} from "socket.io";
// import http from "http";
// import https from "https";
// import express from "express";

// const app = express()
// const server = http.createServer(app);

// const io = new Server(server,{
//     cors:{
//         origin: (origin, callback) => {
//         if (!origin || origin === 'http://localhost:5173' || origin === 'https://localhost:5173') {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//         },
//         credentials: true,
//     }
// });

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// const userSocketMap = {}; // {userId: socketId}

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId) userSocketMap[userId] = socket.id;

//   // io.emit() is used to send events to all the connected clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });

// });

// export {io,app,server};