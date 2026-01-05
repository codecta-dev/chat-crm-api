import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { type AuthUser } from '../../auth/auth.types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { type ContactTableQueryDto, contactTableQuerySchema } from '../../common/schemas/contact-table-query.schema';
import { CurrentUser } from '@auth';

@Controller('contacts')
@UseGuards(AuthGuard('jwt'))
export class ContactsController {
  constructor(private readonly contactService: ContactsService) { }

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthUser) {
    return this.contactService.importCsv(file, user.companyId);
  }

  @Post('table')
  @UsePipes(new ZodValidationPipe(contactTableQuerySchema))
  getTable(@Body() query: ContactTableQueryDto) {
    console.log(query)
    return this.contactService.findPaginated(query);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.contactService.search(q);
  }

  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  @Get(':phone')
  findByPhone(@Param('phone') phone: string) {
    return this.contactService.findByPhone(phone);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    console.log(updateContactDto)
    return this.contactService.update(id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
