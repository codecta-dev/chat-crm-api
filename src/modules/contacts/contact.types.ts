import z from "zod";
import { dataTableBaseSchema } from "../../common/schemas/data-table-base.schema";

const contactFiltersShape = {
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
};

export const userTableQuerySchema = dataTableBaseSchema.extend(contactFiltersShape);

export type ContactQueryDto = z.infer<typeof userTableQuerySchema>;