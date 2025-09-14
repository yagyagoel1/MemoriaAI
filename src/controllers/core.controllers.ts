import { Request, Response } from "express";
import asyncHandler from "../lib/utils/asyncHandler";

import {v4 as uuid} from "uuid"
import {  generateUploadUrl } from "../lib/utils/s3";

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
        });
    }

    return res.status(500).json({
        message: "Failed to generate presigned URL",
    });
});


