import {Router} from "express";

import MessageController from "../controllers/messageController";

const router = Router();
const messageController = new MessageController();

router.post('/', messageController.createMessage);
router.get('/:chatId', messageController.getMessages);
router.get('/:chatId/:messageId', messageController.getSpecificMessage);
router.patch('/:chatId/:messageId/read', messageController.markAsRead);
router.put('/:chatId/:messageId', messageController.updateMessage);
router.delete('/:messageId', messageController.removeMessage);
router.get('/:chatId/unread', messageController.getUnreadMessages);

export default router;