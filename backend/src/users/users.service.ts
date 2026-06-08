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
    // add email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerDto.email)) {
      throw new ConflictException('Invalid email format');
    }

    // Validate password is provided for EMAIL auth
    const authType = registerDto.accountAuthType || 'EMAIL';
    if (authType === 'EMAIL' && !registerDto.password) {
      throw new ConflictException('Password is required for EMAIL authentication');
    }

    const existing = await this.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = registerDto.password ? await bcrypt.hash(registerDto.password, 10) : null;
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name || null,
        password: hashedPassword as any,
        accountAuthType: authType as any,
        avatarUrl: registerDto.avatarUrl || null,
      },
    });
  }

  async validatePassword(password: string, hash: string | null): Promise<boolean> {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  }
}
