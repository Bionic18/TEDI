import {
  Injectable,
  NotImplementedException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { Prisma, User as DbUser } from '../generated/prisma/client.mjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PublicUserDto } from './dto/public-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    throw new NotImplementedException(
      'User' +
        createUserDto.username +
        'creation belongs to the registration flow',
    );
  }

  async findAll(): Promise<PublicUserDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });

    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number): Promise<PublicUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<PublicUserDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return this.toPublicUser(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number): Promise<PublicUserDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { active: false },
      });
      return this.toPublicUser(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private toPublicUser(user: DbUser): PublicUserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      active: user.active,

      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      latitude: user.latitude,
      longitude: user.longitude,
      afm: user.afm,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  async findInternalByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username, active: true },
    });
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Username or email already exists');
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('User not found');
    }
    throw error;
  }
  async approve(id: number): Promise<PublicUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.active) {
      throw new BadRequestException(
        'Only pending users can be approved.',
      );
    }

    const approvedUser = await this.prisma.user.update({
      where: { id },
      data: { active: true },
    });

    return this.toPublicUser(approvedUser);
  }

  async reject(id: number): Promise<PublicUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.roles.includes('admin')) {
      throw new ForbiddenException('Admin users cannot be rejected.');
    }

    if (user.active) {
      throw new BadRequestException(
        'Only pending users can be rejected.',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return this.toPublicUser(user);
  }
  async register(createUserDto: CreateUserDto): Promise<PublicUserDto> {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (!/^\d{9}$/.test(createUserDto.afm)) {
      throw new BadRequestException('AFM must be exactly 9 digits.');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username is already taken.');
      }

      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email is already registered.');
      }
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          passwordHash,
          roles: ['user'],
          active: false,

          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          phone: createUserDto.phone,
          address: createUserDto.address,
          city: createUserDto.city,
          country: createUserDto.country,
          latitude: createUserDto.latitude,
          longitude: createUserDto.longitude,
          afm: createUserDto.afm,
        },
      });

      return this.toPublicUser(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }
}
