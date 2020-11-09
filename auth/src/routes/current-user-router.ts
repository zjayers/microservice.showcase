// Import Modules
import express, { Request, Response, Router } from 'express';
import { getCurrentUser } from '../middleware/get-current-user';

// Init Router
const router: Router = express.Router();

// Handler
router.get(
  '/api/users/currentuser',
  getCurrentUser,
  (req: Request, res: Response): void => {
    res.send({currentUser: req.currentUser || null});
  }
);

// Export named router
export { router as currentUserRouter };
