import { Router } from "express";
import { getSignedUrlForUpload } from "../controllers/core.controllers";


const app = Router()




app.get("/signed-url-for-upload",getSignedUrlForUpload)


export default app