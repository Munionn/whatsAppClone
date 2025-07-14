import {Router} from "express";
import {Request, Response} from "express";

const router = Router();

// get
router.get('/', (req: Request, res: Response) => {})
router.get('/:chadId', (req: Request, res: Response) => {})
router.get('/:chadId/members', (req: Request, res: Response) => {})

// post
router.post('/', (req: Request, res: Response) => {})
router.post('/:chadId/member', (req: Request, res: Response) => {})

//patch
router.patch('/:chadId', (req: Request, res: Response) => {})
router.patch('/:chadId/members', (req: Request, res: Response) => {})
//delete
router.delete('/:chadId', (req: Request, res: Response) => {})
router.delete('/:chadId/members/', (req: Request, res: Response) => {})

export default router;