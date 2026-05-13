import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDocumentDto {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsUUID()
    folderId?: string;

    @IsNotEmpty()
    @IsUUID()
    ownerId!: string;
}
