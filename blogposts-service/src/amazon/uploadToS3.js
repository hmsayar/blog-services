const s3 = require("./amazon-s3");

const uploadToS3 = async (base64ImageWithPrefix, blogPostId) => {
    const match = base64ImageWithPrefix.match(/^data:(image\/(?:png|jpeg|jpg|gif));base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid image format");
    }
    const imageType = match[1];
    const base64Image = match[2];

    const buffer = Buffer.from(base64Image, "base64");

    let fileExtension;
    if (imageType === "image/png") {
        fileExtension = ".png";
    } else if (imageType === "image/jpeg") {
        fileExtension = ".jpeg";
    } else if (imageType === "image/jpg") {
        fileExtension = ".jpg";
    } else {
        throw new Error("Unsupported image type");
    }

    const filename = `images/${blogPostId}/${Date.now()}${fileExtension}`;

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: imageType,
    };

    const response = await s3.upload(params).promise();

    return response.Location;
};

module.exports = uploadToS3;