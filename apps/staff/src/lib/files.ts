import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

console.log("S3 Config:", {
	region: process.env.S3_REGION,
	endpoint: process.env.S3_URL,
	bucket: process.env.S3_BUCKET_NAME,
})

export const S3 = new S3Client({
	region: process.env.S3_REGION || "auto",
	endpoint: process.env.S3_URL,
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
	},
})

export async function getPresignedURL(filePath: string) {
	const url = await getSignedUrl(
		S3,
		new GetObjectCommand({
			Bucket: `${process.env.S3_BUCKET_NAME}`,
			Key: `${filePath}`,
		}),
		{ expiresIn: 3600 },
	)
	return url
}
