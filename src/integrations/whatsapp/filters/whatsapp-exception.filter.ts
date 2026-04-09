import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';
import { WA_CODE_TO_STATUS } from '../whatsapp.constants';
import { WhatsAppErrorBody, WhatsAppErrorResponse } from '../interfaces/whatsapp.interface';

function extractWhatsAppError(exception: unknown): WhatsAppErrorBody | null {
  if ((exception as AxiosError).isAxiosError) {
    return ((exception as AxiosError).response?.data as WhatsAppErrorResponse)?.error ?? null;
  }
  if (exception instanceof HttpException) {
    return (exception.getResponse() as WhatsAppErrorResponse)?.error ?? null;
  }
  return null;
}

function resolveStatus(code: number | undefined, fallback: HttpStatus): HttpStatus {
  return code ? WA_CODE_TO_STATUS[code] ?? fallback : fallback;
}

function mapWhatsAppErrorToResponse(waError: WhatsAppErrorBody, status: HttpStatus) {
  return {
    statusCode: status,
    whatsapp_error: {
      code: waError.code,
      type: waError.type,
      message: waError.message,
    },
  };
}

function mapGenericError(type: string, message: string, status: HttpStatus, details?: string) {
  return {
    statusCode: status,
    error: {
      type,
      message,
      ...(details ? { details } : {})
    },
  };
}

@Catch(HttpException, AxiosError)
export class WhatsAppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WhatsAppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const waError = extractWhatsAppError(exception);

    if ((exception as AxiosError).isAxiosError) {
      const axiosError = exception as AxiosError;
      const status = waError
        ? resolveStatus(waError.code, HttpStatus.BAD_REQUEST)
        : axiosError.response?.status ?? HttpStatus.BAD_GATEWAY;

      if (waError) {
        response.status(status).json(mapWhatsAppErrorToResponse(waError, status));
        return;
      }

      response.status(status).json(
        mapGenericError('UPSTREAM_ERROR', 'Error al comunicarse con la API de WhatsApp', status, axiosError.message)
      );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (waError) {
        const mappedStatus = resolveStatus(waError.code, status);
        response.status(mappedStatus).json(mapWhatsAppErrorToResponse(waError, mappedStatus));
        return;
      }

      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Error)?.message ?? 'Error desconocido';

      response.status(status).json(mapGenericError('HTTP_ERROR', message, status));
      return;
    }

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(mapGenericError('INTERNAL_ERROR', 'Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR));
  }
}
