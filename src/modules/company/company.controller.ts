import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyGuard } from './company.guard';
import { JwtAuthGuard } from '@auth/guards';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(
    private readonly service: CompanyService,
  ) { }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.service.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('me')
  @UseGuards(CompanyGuard)
  me() {
    return this.service.info;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
  //   return this.service.update(+id, updateCompanyDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
