import { z } from "zod";
import { dataTableBaseSchema } from "./data-table-base.schema";

const contactFiltersShape = {
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  status: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
};

export const contactTableQuerySchema = dataTableBaseSchema.extend(contactFiltersShape);

export type ContactTableQueryDto = z.infer<typeof contactTableQuerySchema>;