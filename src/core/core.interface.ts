import { UpdateResult } from "typeorm";

export type DTO = { [key: string]: any }
export type Entity = {
  id: string; // UUID only
  [key: string]: any
}

export interface Core<T extends Entity> {
  all(): Promise<T[]>;
  create(dto: DTO): Promise<T>;
  update(id: string, dto: DTO): Promise<UpdateResult>;
}
