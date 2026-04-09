import 'nestjs-cls';

declare module "nestjs-cls" {
  interface ClsStore {
    company?: { id: string };
    user?: { id: string };
  }
}
