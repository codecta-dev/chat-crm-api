import { ObjectLiteral, Repository } from "typeorm";

export class CoreRepository<T extends ObjectLiteral> {
  constructor(protected readonly repo: Repository<T>) { }

  async all(): Promise<T[]> {
    return this.repo.find();
  }

  async find(entity: Partial<T>) {
    return this.repo.findOneBy(entity)
  }
}