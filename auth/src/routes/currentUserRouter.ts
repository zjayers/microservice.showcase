/* Import Modules */
import express from "express";

/* Init Router */
const router = express.Router();

/* Handler */
router.get("/api/users/currentuser", (req, res) => {
  res.send("Hi there!");
});

/* Export named router */
export { router as currentUserRouter };
