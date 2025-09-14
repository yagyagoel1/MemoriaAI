import { Router } from "express";
import { generateEmbeddings, getSignedUrlForUpload } from "../controllers/core.controllers";


const app = Router()




app.get("/signed-url-for-upload/:type",getSignedUrlForUpload)
app.post("/generate-embeddings",generateEmbeddings)

export default app