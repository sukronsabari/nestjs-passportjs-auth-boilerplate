import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  public async findUsers() {
    const users = await this.prismaService.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });

    return users;
  }
}
