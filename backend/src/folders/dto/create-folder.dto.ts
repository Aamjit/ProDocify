import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsUUID()
    ownerId!: string;
}
