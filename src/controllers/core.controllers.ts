import { Request, Response } from "express";
import asyncHandler from "../lib/utils/asyncHandler";
    import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {v4 as uuid} from "uuid"
import {  fetchGetPreSignedUrl, generateUploadUrl } from "../lib/utils/s3";
import { logger } from "..";
import memory from "../lib/mem0/init";
import {OpenAI} from "openai"
import { PROMPT_TO_CREATE_QUESTIONS } from "../lib/llm/prompts";
const openai = new OpenAI()
export const getSignedUrlForUpload = asyncHandler(async (req: Request, res: Response) => {
    const randomUUID = uuid();
    const type = req.params.type as string;
    const mimeTypes: Record<string, string> = {
        image: "image/jpeg", 
        pdf: "application/pdf",
    };

    const urlType = mimeTypes[type];
    if (!urlType) {
        return res.status(400).json({ message: "Invalid upload type" });
    }

    const preSignedUrl = await generateUploadUrl(randomUUID, urlType);

    if (preSignedUrl?.success) {
        return res.json({
            message: "Successfully created a presigned URL",
            url: preSignedUrl.url,
            accessId:randomUUID
        });
    }

    return res.status(500).json({
        message: "Failed to generate presigned URL",
    });
});

export const generateEmbeddings = asyncHandler(async(req:Request,res:Response)=>{
    logger.info(req.body)
    const resourceId = req?.body?.resourceId
    if(!resourceId){
        return res.status(400).json({
            "message":"resource id is required"
        })
    }
    const preSignedUrl = await fetchGetPreSignedUrl(resourceId)
    if(!preSignedUrl.success||!preSignedUrl.url){
        return res.status(400).json({
            "message":"unable to find the resource:"+preSignedUrl?.msg
        })
    }

const response = await fetch(preSignedUrl.url);
const arrayBuffer = await response.arrayBuffer();
const blob = new Blob([arrayBuffer], { type: "application/pdf" });

const loader = new PDFLoader(blob);
const docs = await loader.load();
for (const doc of  docs){
for (const [i, doc] of docs.entries()) {
  await memory.add(
    doc.pageContent,
    {
      userId: resourceId,
      metadata: { page: i + 1 }
    }
  );
}

}
return res.status(200).json({
    "message":"stored in the memory successfully"
})

})

export const createQuestion = asyncHandler(async(req:Request,res:Response)=>{
    const prompt = req.body.prompt;
    console.log(req.body.resourceId)
    const results = await memory.search(prompt+".Trying to create question from the content around this", {
  userId:req.body.resourceId
})
    let memorydata="";
    for(const result of results.results){
        memorydata+=`data:${result.memory} score:${result.score}`
    }

    const response =await  openai.responses.create({
        model:"gpt-4.1",
        input:[
            {
                role:"assistant",
                content:PROMPT_TO_CREATE_QUESTIONS
            },
            {
                role:"system",
                content:"here is the memory which will help you to create questions"+memorydata
            },{
                role:"user",
                content:prompt
            }
        ]
})
logger.info(memorydata)
   const outputText = response.output_text;
logger.info(outputText)
// Parse JSON safely
let outputJson;
try {
    outputJson = JSON.parse(outputText);
} catch (err) {
    // If parsing fails, return failure JSON
    outputJson = { success: 0 };
}

// Return the parsed JSON
logger.info(outputJson)
return res.status(200).json({
    success:1,
    outputJson
})
})