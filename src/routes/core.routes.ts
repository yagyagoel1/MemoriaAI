import { Router } from "express";
import { createQuestion, generateEmbeddings, getSignedUrlForUpload } from "../controllers/core.controllers";


const app = Router()




app.get("/signed-url-for-upload/:type",getSignedUrlForUpload)
app.post("/generate-embeddings",generateEmbeddings)
app.post("/create-question-from-prompt",createQuestion)
export default app