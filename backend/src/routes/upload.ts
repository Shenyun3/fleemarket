// backend/routes/upload.ts

import { Hono } from "hono";
import { uploadImage } from "../controllers/uploadController.js";

const upload = new Hono();

upload.post("/", uploadImage);

export default upload;
