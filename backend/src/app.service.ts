import { Injectable } from '@nestjs/common';
import { S3, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

@Injectable()
export class AppService {

	private s3 = new S3({
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_ID,
			secretAccessKey: process.env.AWS_ACCESS_SECRET,
		},
		region: process.env.AWS_S3_REGION,
	});

	async s3_upload(file: Express.Multer.File) : Promise<string> {
		const up = await new Upload({
			client: this.s3,
			params: {
				ACL: 'public-read',
				Bucket: process.env.AWS_S3_BUCKET,
				Key: `${Date.now().toString()}-${file.originalname} `,
				Body: file.buffer,
			},
		}).done();
		return up.Location;
	}
}
