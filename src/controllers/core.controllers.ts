import { Request, Response } from "express";
import asyncHandler from "../lib/utils/asyncHandler";
    import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {v4 as uuid} from "uuid"
import {  fetchGetPreSignedUrl, generateUploadUrl } from "../lib/utils/s3";
import { logger } from "..";
import memory from "../lib/mem0/init";

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
