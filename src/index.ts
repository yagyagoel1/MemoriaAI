import express from "express"
import pino from "pino"



const logger = pino({level:"info"})


const router = express()





router.listen(process.env.PORT,()=>{
logger.info("server running on port"+process.env.PORT)
})