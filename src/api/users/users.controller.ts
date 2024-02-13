import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '@/decorators/auth.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(Role.ADMIN)
  @Get()
  async findAll() {
    return this.usersService.findUsers();
  }
}
