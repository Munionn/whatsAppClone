import { Router } from "express";
import { Request, Response } from "express";
import ChatController from "../controllers/chat.controller";

const router = Router();

// GET
router.get('/', ChatController.getUsersChats);
router.get('/:chatId', ChatController.getChat);
router.get('/:chatId/members', ChatController.getMembers);

// POST
router.post('/', ChatController.createChat);
router.post('/:chatId/member', ChatController.addMembers);

// PATCH
router.patch('/:chatId', ChatController.updateChatDate);
router.patch('/:chatId/members', ChatController.updateChatMembers);

// DELETE
router.delete('/:chatId', ChatController.deleteChat);
router.delete('/:chatId/members', ChatController.deleteMembers); // removed extra slash

export default router;