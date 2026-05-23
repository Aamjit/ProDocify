import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty({ description: 'User ID (UUID)' })
    id!: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    email!: string;

    @Exclude()
    password!: string;

    @ApiProperty({ description: 'User creation timestamp' })
    createdAt!: Date;

    @ApiProperty({ description: 'User last update timestamp' })
    updatedAt!: Date;
}
