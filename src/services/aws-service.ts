import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const getFileStreamFromS3 = (bucketId: string, key: string) =>
  s3.getObject({ Bucket: bucketId, Key: key }).createReadStream();

export const getFileUrl = (bucketId: string, key: string, validSec = 60) =>
  s3.getSignedUrl("getObject", {
    Bucket: bucketId,
    Key: key,
    Expires: validSec,
  });

export const getUploadUrl = (
  bucketId: string,
  key: string,
  contentType: string,
  validSec = 360
) =>
  s3.getSignedUrl("putObject", {
    Bucket: bucketId,
    Key: key,
    Expires: validSec,
    ContentType: contentType,
  });
