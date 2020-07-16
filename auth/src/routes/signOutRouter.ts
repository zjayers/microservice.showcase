/* Import Modules */
import express from "express";

/* Init Router */
const router = express.Router();

/* Handler */
router.post("/api/users/signout", (req, res) => {
  res.send("Hi there!");
});

/* Export named router */
export { router as signOutRouter };
