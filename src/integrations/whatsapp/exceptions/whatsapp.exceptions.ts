import {
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';

import { AxiosError } from 'axios';

interface FacebookError {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export class WhatsAppHttpException extends HttpException {
  public readonly type: string;
  constructor(err: AxiosError) {
    const data = err.response?.data as { error?: FacebookError };
    const message = data?.error?.message ?? 'WhatsApp error';
    const type = data?.error?.type ?? 'Unknown';

    super(message, err.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR);
    this.type = type;
  }
}

export class WhatsAppNotConfiguredException extends UnauthorizedException {
  constructor() {
    super("");
  }
}

export class WhatsAppInvalidConfigException extends BadRequestException {
  constructor(businessId: string) {
    super({
      success: false,
      error: 'InvalidConfig',
      message: `Invalid configuration for businessId: ${businessId}`,
      module: 'WhatsApp',
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

export class WhatsAppApiException extends InternalServerErrorException {
  constructor(message: string, type: string, status?: number) {
    super({
      success: false,
      error: type,
      message,
      module: 'WhatsApp',
      statusCode: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}

export class WhatsAppUnexpectedStatusException extends InternalServerErrorException {
  constructor(status: number) {
    super({
      success: false,
      error: 'UnexpectedStatus',
      message: `WhatsApp API returned unexpected status: ${status}`,
      module: 'WhatsApp',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
