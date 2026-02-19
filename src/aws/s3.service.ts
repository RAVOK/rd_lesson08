import { Injectable, Inject } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly bucketName: string;
  private readonly urlExpiration: number;

  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.urlExpiration =
      parseInt(this.configService.get<string>('AWS_PRESIGN_EXPIRATION') || '3600');
  }

  /**
   * Generate a presigned PUT URL for direct upload to S3
   */
  async generatePresignedPutUrl(
    key: string,
    contentType: string,
    expiresIn?: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const expiration = expiresIn || this.urlExpiration;
    return await getSignedUrl(this.s3Client, command, { expiresIn: expiration });
  }

  /**
   * Generate a presigned GET URL for downloading from S3
   */
  async generatePresignedGetUrl(
    key: string,
    expiresIn?: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const expiration = expiresIn || this.urlExpiration;
    return await getSignedUrl(this.s3Client, command, { expiresIn: expiration });
  }

  /**
   * Delete an object from S3
   */
  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Generate a unique S3 key for a file
   */
  generateKey(
    userId: number,
    folder: string,
    fileName: string,
    extension?: string,
  ): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = extension || this.extractExtension(fileName);
    return `${folder}/${userId}/${timestamp}-${random}.${ext}`;
  }

  /**
   * Extract file extension from filename
   */
  private extractExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()! : 'bin';
  }
}