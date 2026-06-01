import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(registerDto: RegisterDto) {
    const existing = await this.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
      },
    });
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
