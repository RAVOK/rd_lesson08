export class PresignUploadResponseDto {
  fileId: number;
  key: string;
  uploadUrl: string;
  contentType: string;
}