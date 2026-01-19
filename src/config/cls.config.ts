import { Payload } from "@auth";
import { Request } from "express";
import { ClsModuleOptions } from "nestjs-cls";

interface RequestAuth extends Request {
  user: Payload
}

export const clsConfig: ClsModuleOptions = {
  global: true,
  interceptor: {
    mount: true,
    setup: (cls, context) => {
      const req = context.switchToHttp().getRequest<RequestAuth>();
      cls.set('company-id', req.headers['x-company-id']);
      cls.set('user-id', req.user?.sub)
    },
  },
};