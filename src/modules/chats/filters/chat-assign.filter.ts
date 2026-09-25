import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { QueryFailedError } from "typeorm";

@Catch(QueryFailedError)
export class ChatAssignExceptionFilter implements ExceptionFilter<QueryFailedError> {
  catch(exception: QueryFailedError<Error> & { code: string }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;
    let message: string = 'Database Error';

    switch (exception.code) {
      case "ER_NO_REFERENCED_ROW_2":
      case "SQLITE_CONSTRAINT_FOREIGNKEY":
        message = 'Agent or chat no exist';
        break;
      case "23505":
      case "ER_DUP_ENTRY":
      case "SQLITE_CONSTRAINT":
        message = 'Agent is already assigned to chat';
        break;
    }

    return response.status(status).json({
      message,
      code: exception.code,
    })
  }
}