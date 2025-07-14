import {Router} from "express";
import {Request, Response, NextFunction} from "express";
import MessageController from "../controllers/messageController";

const router = Router();


router.post('/', (req: Request, res: Response) => {
    MessageController.createMessage(req, res);
});
router.get('/:chatId', (req: Request, res: Response) => {
    MessageController.getMessages(req, res)
});
router.get('/:chatId/:messageId', (req: Request, res: Response) => {
    MessageController.getSpecificMessage(req, res);
});
router.patch('/:chatId/:messageId/read', (req: Request, res: Response) => {
    MessageController.markAsRead(req, res);
});
router.put('/:chatId/:messageId', (req: Request, res: Response) => {
    MessageController.updateMessage(req, res);
});
router.delete('/:messageId', (req: Request, res: Response) => {
    MessageController.removeMessage(req, res);
});
router.get('/:chatId/unread', (req: Request, res: Response) => {
    MessageController.getUnreadMessages(req, res);
});

export default router;