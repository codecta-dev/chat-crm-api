import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
    private readonly cls: ClsService,
  ) { }

  get info() {
    const company = this.repo.findOneBy({ id: this.id });

    return company
  }

  get id() {
    const companyId = this.cls.get<string>('company-id');

    return companyId
  }

  create(dto: CreateCompanyDto) {
    return this.repo.save(dto);
  }

  findAll() {
    return `This action returns all companies`;
  }

  async findOne(id: string) {
    return await this.repo.findOneBy({ id });
  }

  // update(id: number, updateCompanyDto: UpdateCompanyDto) {
  //   return `This action updates a #${id} company`;
  // }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
