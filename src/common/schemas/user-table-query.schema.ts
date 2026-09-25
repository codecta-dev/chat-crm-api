import { z } from "zod";
import { dataTableBaseSchema } from "./data-table-base.schema";

const userFiltersShape = {
  username: z.string().optional(),
  role: z.string().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.string().optional(),
};

export const userTableQuerySchema = dataTableBaseSchema.extend(userFiltersShape);

export type UserTableQueryDto = z.infer<typeof userTableQuerySchema>;