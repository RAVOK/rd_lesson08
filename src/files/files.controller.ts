import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileRecordDto } from './dto/create-file-record.dto';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { FileRecord, FileStatus, FileVisibility } from './file-record.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async presignUpload(
    @Request() req,
    @Body() presignUploadDto: PresignUploadDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return await this.filesService.presignUpload(userId, presignUploadDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFileRecordDto: CreateFileRecordDto): Promise<FileRecord> {
    return await this.filesService.create(createFileRecordDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<FileRecord> {
    return await this.filesService.findById(+id);
  }

  @Get()
  async findByOwnerId(@Query('ownerId') ownerId?: string): Promise<FileRecord[]> {
    if (ownerId) {
      return await this.filesService.findByOwnerId(+ownerId);
    }
    return [];
  }

  @Get('entity/:entityId')
  async findByEntityId(@Param('entityId') entityId: string): Promise<FileRecord[]> {
    return await this.filesService.findByEntityId(+entityId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: FileStatus,
  ): Promise<FileRecord> {
    return await this.filesService.updateStatus(+id, status);
  }

  @Put(':id/visibility')
  async updateVisibility(
    @Param('id') id: string,
    @Body('visibility') visibility: FileVisibility,
  ): Promise<FileRecord> {
    return await this.filesService.updateVisibility(+id, visibility);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.filesService.delete(+id);
  }
}