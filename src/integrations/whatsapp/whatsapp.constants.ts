import { HttpStatus } from "@nestjs/common";

export const WA_CODE_TO_STATUS: Record<number, HttpStatus> = {
  // Auth
  190: HttpStatus.UNAUTHORIZED,
  102: HttpStatus.UNAUTHORIZED,
  // Permisos
  10: HttpStatus.FORBIDDEN,
  200: HttpStatus.FORBIDDEN,
  // Rate limit
  4: HttpStatus.TOO_MANY_REQUESTS,
  80007: HttpStatus.TOO_MANY_REQUESTS,
  131048: HttpStatus.TOO_MANY_REQUESTS,
  131049: HttpStatus.TOO_MANY_REQUESTS,
  // Mensajes
  131000: HttpStatus.BAD_REQUEST,
  131005: HttpStatus.FORBIDDEN,
  131006: HttpStatus.BAD_REQUEST,
  131008: HttpStatus.BAD_REQUEST,
  131009: HttpStatus.BAD_REQUEST,
  131016: HttpStatus.SERVICE_UNAVAILABLE,
  131021: HttpStatus.BAD_REQUEST,
  131026: HttpStatus.BAD_REQUEST,
  131047: HttpStatus.BAD_REQUEST,
  // Plantillas
  132000: HttpStatus.BAD_REQUEST,
  132001: HttpStatus.BAD_REQUEST,
  132005: HttpStatus.BAD_REQUEST,
  132007: HttpStatus.BAD_REQUEST,
  132012: HttpStatus.BAD_REQUEST,
  132015: HttpStatus.FORBIDDEN,
  132016: HttpStatus.FORBIDDEN,
  // Registro
  133000: HttpStatus.BAD_REQUEST,
  133004: HttpStatus.SERVICE_UNAVAILABLE,
  133005: HttpStatus.UNAUTHORIZED,
  133006: HttpStatus.FORBIDDEN,
  133008: HttpStatus.FORBIDDEN,
  133009: HttpStatus.FORBIDDEN,
  133010: HttpStatus.BAD_REQUEST,
  131030: HttpStatus.BAD_REQUEST,
};