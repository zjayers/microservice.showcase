/* Import Modules */
import express from "express";

/* Init Router */
const router = express.Router();

/* Handler */
router.post("/api/users/signin", (req, res) => {
  res.send("Hi there!");
});

/* Export named router */
export { router as signInRouter };
