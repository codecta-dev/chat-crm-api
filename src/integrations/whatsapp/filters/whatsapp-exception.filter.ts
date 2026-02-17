import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { PinoLogger } from "nestjs-pino";
import { WhatsAppHttpException } from "../exceptions/whatsapp.exceptions";

export interface ErrorResponse {
  sucess: boolean;
  message: string;
  type: string;
  timestamp: string;
  stack?: string;
}

@Catch(HttpException)
export class WhatsAppExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) { }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const context = exception instanceof WhatsAppHttpException
      ? exception.type
      : exception.name;

    const errorResponse: ErrorResponse = {
      sucess: false,
      message: exception.message ?? "Error en WhatsApp",
      type: context,
      timestamp: new Date().toISOString(),
    };

    this.logger.setContext(context);
    this.logger.error(exception.message);
    this.logger.trace(exception.stack);

    response.status(status).json(errorResponse);
  }
}
