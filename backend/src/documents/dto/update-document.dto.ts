import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDocumentDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsUUID()
    folderId?: string;

    @IsOptional()
    @IsUUID()
    ownerId?: string;
}
