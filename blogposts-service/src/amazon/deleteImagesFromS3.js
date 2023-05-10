const s3 = require("./amazon-s3");

const deleteImagesFromS3 = async (blogPostId) => {
    const listParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `images/${blogPostId}/`,
    };
  
    const listedObjects = await s3.listObjectsV2(listParams).promise();
  
    if (listedObjects.Contents.length === 0) return;
  
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: [],
      },
    };
  
    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });
  
    await s3.deleteObjects(deleteParams).promise();
  
    if (listedObjects.IsTruncated) await deleteImagesFromS3(blogPostId); // If there are more than 1000 image in one folder
  };
  
  module.exports = deleteImagesFromS3;