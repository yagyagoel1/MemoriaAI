import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl, } from "@aws-sdk/s3-request-presigner";
import { logger } from "../..";

// Initialize S3 client
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID||"",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY||"",
  },
});

const bucketName = "poemstorage"
async function generateUploadUrl( id:string,type:string= "application/pdf") {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: "uploads/"+id,
    ContentType:type, 
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return {success:true,url};
}
 const fetchGetPreSignedUrl = async(id:string)=>{
    
try {
        const command = new GetObjectCommand({ Bucket: bucketName, Key: "uploads/"+id });
    const url =await getSignedUrl(s3,command,{expiresIn:3600})
    return {success:true,url}
} catch (error) {

    logger.error(error)
    if(error instanceof Error){
        return {
            success:false,
            msg:error.message
        }
    }
    return {success:false}
}
}

export {
    generateUploadUrl,
    fetchGetPreSignedUrl
}