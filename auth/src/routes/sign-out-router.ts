// Import Modules
import express, { Request, Response, Router } from 'express';

// Init Router
const router: Router = express.Router();

// Handler
router.post('/api/users/signout', (req: Request, res: Response): void => {
  // Remove the jwt session and log out the user
  req.session = null;
  res.send({});
});

// Export named router
export { router as signOutRouter };
