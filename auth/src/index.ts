import express from "express";

const app = express();
app.use(express.json());

/* Handlers */
app.get("/api/users/currentuser", (req, res) => {
  res.send("Auth - GET - working");
});

/* Listen For Requests */
app.listen(3000, () => {
  console.log("Auth Service - listening on port: 3000");
});
