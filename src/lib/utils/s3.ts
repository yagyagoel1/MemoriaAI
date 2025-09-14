import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  return {success:1,url};
}


export {
    generateUploadUrl
}