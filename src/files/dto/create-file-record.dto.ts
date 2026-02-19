import { IsString, IsInt, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { FileStatus, FileVisibility } from '../file-record.entity';

export class CreateFileRecordDto {
  @IsInt()
  @IsNotEmpty()
  ownerId: number;

  @IsInt()
  @IsOptional()
  entityId?: number;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsInt()
  @IsNotEmpty()
  size: number;

  @IsEnum(FileStatus)
  @IsOptional()
  status?: FileStatus;

  @IsEnum(FileVisibility)
  @IsOptional()
  visibility?: FileVisibility;
}