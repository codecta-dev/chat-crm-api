import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import type { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Rol solo por update (no en create: sin auto-escalacion al registrarse).
  @IsOptional()
  @IsIn(['admin', 'supervisor', 'support', 'agent', 'system'])
  role?: UserRole;
}
