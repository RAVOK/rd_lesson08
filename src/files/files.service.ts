import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord, FileStatus, FileVisibility } from './file-record.entity';
import { CreateFileRecordDto } from './dto/create-file-record.dto';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { PresignUploadResponseDto } from './dto/presign-upload-response.dto';
import { S3Service } from '../aws/s3.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRecordRepository: Repository<FileRecord>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createFileRecordDto: CreateFileRecordDto): Promise<FileRecord> {
    const fileRecord = this.fileRecordRepository.create({
      ...createFileRecordDto,
      status: createFileRecordDto.status || FileStatus.PENDING,
      visibility: createFileRecordDto.visibility || FileVisibility.PRIVATE,
    });

    return await this.fileRecordRepository.save(fileRecord);
  }

  async findById(id: number): Promise<FileRecord> {
    const fileRecord = await this.fileRecordRepository.findOne({
      where: { id },
    });

    if (!fileRecord) {
      throw new NotFoundException(`FileRecord with ID ${id} not found`);
    }

    return fileRecord;
  }

  async findByOwnerId(ownerId: number): Promise<FileRecord[]> {
    return await this.fileRecordRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntityId(entityId: number): Promise<FileRecord[]> {
    return await this.fileRecordRepository.find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: FileStatus): Promise<FileRecord> {
    const fileRecord = await this.findById(id);
    fileRecord.status = status;
    return await this.fileRecordRepository.save(fileRecord);
  }

  async updateVisibility(
    id: number,
    visibility: FileVisibility,
  ): Promise<FileRecord> {
    const fileRecord = await this.findById(id);
    fileRecord.visibility = visibility;
    return await this.fileRecordRepository.save(fileRecord);
  }

  async delete(id: number): Promise<void> {
    const fileRecord = await this.findById(id);
    await this.fileRecordRepository.remove(fileRecord);
  }

  /**
   * Generate presigned upload URL and create FileRecord
   */
  async presignUpload(
    userId: number,
    presignUploadDto: PresignUploadDto,
  ): Promise<PresignUploadResponseDto> {
    const { fileName, contentType, folder = 'uploads', entityId, fileSize } = presignUploadDto;

    // Generate unique S3 key
    const key = this.s3Service.generateKey(userId, folder, fileName);

    // Create FileRecord with PENDING status
    const fileRecord = await this.create({
      ownerId: userId,
      entityId,
      key,
      contentType,
      size: fileSize || 0,
      status: FileStatus.PENDING,
      visibility: FileVisibility.PRIVATE,
    });

    // Generate presigned PUT URL
    const uploadUrl = await this.s3Service.generatePresignedPutUrl(key, contentType);

    return {
      fileId: fileRecord.id,
      key,
      uploadUrl,
      contentType,
    };
  }

  /**
   * Mark file as ready after successful upload
   */
  async markAsReady(fileId: number): Promise<FileRecord> {
    return await this.updateStatus(fileId, FileStatus.READY);
  }

  /**
   * Generate presigned download URL
   */
  async getDownloadUrl(fileId: number): Promise<string> {
    const fileRecord = await this.findById(fileId);
    return await this.s3Service.generatePresignedGetUrl(fileRecord.key);
  }
}