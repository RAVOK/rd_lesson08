import { IsString, IsNotEmpty, IsOptional, IsInt, Max } from 'class-validator';

export class PresignUploadDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsInt()
  @IsOptional()
  entityId?: number;

  @IsInt()
  @IsOptional()
  @Max(100 * 1024 * 1024) // 100MB max
  fileSize?: number;
}