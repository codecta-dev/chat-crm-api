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
      const companyId = req.headers['x-company-id'] as string;
      const userId = req.user?.sub;

      cls.set('company.id', companyId);
      cls.set('user.id', userId);
    },
  },
};