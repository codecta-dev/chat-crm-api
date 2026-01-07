import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CsvParser } from 'nest-csv-parser';
import { PinoLogger } from 'nestjs-pino';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { FindManyOptions, In, IsNull, Like, Not, Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UserTableQueryDto } from '../../common/schemas/user-table-query.schema';
import { buildQueryOptions } from '../../lib/helpers/build-query-options.helper';
import { Chat } from '../chats/entities';
import { Company } from '../companies/entities/company.entity';
import { User } from './entities/user.entity';
import { CoreService } from '@core/core.service';

@Injectable()
export class UsersService extends CoreService<User> {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    private readonly logger: PinoLogger,
    private readonly csv: CsvParser,
  ) { super(repo) }

  async importCsv(file: Express.Multer.File, companyId?: string): Promise<{ count: number }> {
    const stream = Readable.from(file.buffer);
    const parsed = await this.csv.parse(stream, CreateUserDto, undefined, undefined, {
      strict: true,
      separator: ',',
    });

    const users = await Promise.all(
      parsed.list.map(async (row: Partial<User>) => ({
        username: row.username,
        firstNames: row.firstNames,
        lastNames: row.lastNames,
        phoneNumber: row.phoneNumber,
        email: row.email,
        password: await bcrypt.hash(row.password ?? 'password', 10),
        role: row.role ?? 'agent',
        company: { id: companyId },
      }))
    );

    await this.repo.insert(users);

    return { count: users.length };
  }

  async online(id: string) {
    const result = await this.repo.update({ id }, { status: 'online' })
    return result.affected === 1;
  }

  async offline(id: string) {
    const result = await this.repo.update({ id }, { status: 'offline' })
    return result.affected === 1;
  }

  async table(query: UserTableQueryDto): Promise<Pagination<User>> {
    const { findOptions, paginationOptions } = buildQueryOptions<User>(query);

    const defaultFindOptions: FindManyOptions<User> = {
      where: { deletedAt: IsNull() },
      order: { status: 'DESC', updatedAt: 'DESC' },
    };

    const mergedFindOptions: FindManyOptions<User> = {
      ...defaultFindOptions,
      ...findOptions,
      where: { ...defaultFindOptions.where, ...findOptions.where },
      order: { ...defaultFindOptions.order, ...findOptions.order },
    };

    return paginate<User>(
      this.repo,
      paginationOptions,
      mergedFindOptions,
    );
  }

  // TODO: Using CoreService in this
  override async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repo.create({
      ...createUserDto,
      company: { id: createUserDto.companyId } as Company
    })
    return this.repo.save(user);
  }

  searchUser(dto: UserSearchDto) {
    const { q, limit } = dto;
    const findOptions: FindManyOptions<User> = {
      where: q ? [
        { username: Like(`%${q}%`) },
        { firstNames: Like(`%${q}%`) },
        { lastNames: Like(`%${q}%`) },
      ] : {},
      take: limit,
      order: { username: 'ASC' }
    };

    return this.repo.find(findOptions);
  }

  findOne(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findOrCreateSystemUser(companyId: string): Promise<User> {
    const existing = await this.repo.findOne({ where: { role: 'system', company: { id: companyId } } });

    if (existing) return existing;

    const created = this.repo.create({
      role: 'system',
      username: 'System',
      password: "password", // Will be hashed before insert
      status: 'online',
      company: { id: companyId },
    });

    return this.repo.save(created);
  }

  async findAvailableAgent(companyId: string): Promise<User> {
    const roles = ['system', 'admin'];

    const agents = await this.repo.find({
      where: {
        company: { id: companyId },
        role: Not(In(roles)),
        status: 'online',
      },
      order: {
        status: 'DESC',
        username: 'ASC'
      },
      relations: ['company'],
    });

    if (agents.length === 0) {
      return this.findOrCreateSystemUser(companyId);
    }

    const agentsWithLoad = await Promise.all(
      agents.map(async (agent) => {
        const activeChats = await this.chatRepo.count({
          where: { assignedAgent: { id: agent.id }, status: 'open' },
        });
        return { agent, activeChats };
      }),
    );

    agentsWithLoad.sort((a, b) => a.activeChats - b.activeChats);
    const bestAgent = agentsWithLoad[0].agent;

    this.logger.debug(`Selected agent ${bestAgent.username}`);
    return bestAgent;
  }

  async getAgent() {
    const agent = await this.repo.findOne({ where: { status: 'online' } });
    if (agent) return agent;
  }

  // TODO: Using CoreService in this
  override update(id: string, dto: UpdateUserDto): Promise<UpdateResult> {
    return this.repo.update(id,
      {
        ...dto,
        password: bcrypt.hashSync(dto.password ?? 'password', 10),
      }
    )
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete({ id });
  }
}
