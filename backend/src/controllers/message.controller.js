import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const getUsersfForSidebar = async (req, res)=>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("error in getUsersForSidebar:", error.message);
        res.status(500).json({error:"Internal server error"});
    }
};

// export const getUsersWithUnreadCounts = async (req, res) => {
//     try {
//         const loggedInUserId = req.user._id;

//         const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

//         const usersWithUnreadCounts = await Promise.all(
//             users.map(async (user) => {
//                 const unreadCount = await Message.countDocuments({
//                     senderId: user._id,
//                     receiverId: loggedInUserId,
//                     seen: false
//                 });

//                 return {
//                     _id: user._id,
//                     fullName: user.fullName,
//                     email: user.email,
//                     profilePic: user.profilePic,
//                     createdAt: user.createdAt,
//                     unreadCount
//                 };
//             })
//         );

//         res.status(200).json(usersWithUnreadCounts);

//     } catch (error) {
//         console.error("Error in getUsersWithUnreadCounts:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

// const users = await User.find({ _id: { $ne: req.user._id } });

// export const usersWithUnreadCounts = await Promise.all(
//   users.map(async (user) => {
//     const unreadCount = await Message.countDocuments({
//       senderId: user._id,
//       receiverId: req.user._id,
//       isSeen: false,
//     });

//     return {
//       _id: user._id,
//       fullName: user.fullName,
//       profilePic: user.profilePic,
//       unreadCount,
//     };
//   })
// );

// res.status(200).json(usersWithUnreadCounts);

export const getMessages = async(req,res)=>{
    try {
        const {id:userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId},
            ]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("error in getmessages controller",error.message);
        res.status(500).json({error:"Internal server error"});
    }
};

//main
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const recieverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// export const sendMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: receiverId } = req.params;
//     const senderId = req.user._id;

//     let imageUrl;

//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image, {
//         folder: "chat-app/messages",
//       });
//       imageUrl = uploadResponse.secure_url;
//     }

//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       text,
//       image: imageUrl,
//     });

//     await newMessage.save();

//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }

//     res.status(200).json(newMessage);
//   } catch (error) {
//     console.error("Error in sendMessage controller:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


// export const sendMessage = async (req, res) => {
//     try {
//         const receiverId = req.params.id;
//         const senderId = req.user._id;
//         const { text, image } = req.body;

//         console.log("req.body:", req.body);

//         console.log("receiverId:", receiverId);
//         console.log("senderId:", senderId);
//         console.log("message:", text);

//         if (!receiverId) {
//             return res.status(400).json({ message: "receiverId is required" });
//         }

//         if (!text && !image) {
//             return res.status(400).json({ message: "Message content is required" });
//         }

//         const newMessage = await Message.create({
//             senderId,
//             receiverId,
//             text,
//             image,
//         });

//         console.log("Saved newMessage:", newMessage);

//         await newMessage.save();

//         const receiverSocketId = getReceiverSocketId(receiverId);
//         if (receiverSocketId) {
//         io.to(receiverSocketId).emit("newMessage", newMessage);
//         }

//         res.status(201).json(newMessage);
//     } catch (error) {
//         console.log("Error in sendMessage controller", error.message);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// export const markMessagesAsSeen = async (req, res) => {
//     try {
//         const { userId } = req.body; // senderId (the user whose messages I want to mark as seen)
//         const loggedInUserId = req.user._id; // me (receiverId)

//         await Message.updateMany(
//             {
//                 senderId: userId,
//                 receiverId: loggedInUserId,
//                 seen: false
//             },
//             { $set: { seen: true } }
//         );

//         res.status(200).json({ message: "Messages marked as seen" });
//     } catch (error) {
//         console.error("Error in markMessagesAsSeen:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

