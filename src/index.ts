import express from "express"
import pino from "pino"
import dotenv from "dotenv";
dotenv.config();
import coreRouter from "./routes/core.routes"

export const logger = pino({level:"info"})




const router = express()
router.use(express.json())
router.use("/api/v1/core",coreRouter)



router.listen(process.env.PORT,()=>{
logger.info("server running on port: "+process.env.PORT)
})