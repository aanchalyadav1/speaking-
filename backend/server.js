import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

import "./firebase.js"; // <-- Firebase loads only once
import uploadRoute from "./routes/upload.js";
import { initFirestore } from "./utils/firestore.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

await initFirestore();

app.use("/api/upload", uploadRoute);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
