import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersfForSidebar } from "../controllers/message.controller.js";
import { getMessages } from "../controllers/message.controller.js";
import { sendMessage } from "../controllers/message.controller.js";
//import { markMessagesAsSeen } from "../controllers/message.controller.js";
//import { getUsersWithUnreadCounts } from "../controllers/message.controller.js";

const router = express.Router();


router.get("/user",protectRoute,getUsersfForSidebar);

// router.get("/user",protectRoute,getUsersfForSidebar);

router.get("/user/:id", protectRoute,getMessages);

router.post("/send/:id", protectRoute, sendMessage);

//router.post("/mark-seen",protectRoute, markMessagesAsSeen);


export default router;