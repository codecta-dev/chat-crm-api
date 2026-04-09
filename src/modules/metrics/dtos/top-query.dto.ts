import { IsIn, IsNumber, IsString } from "class-validator";

export class TopQuery {
  @IsNumber()
  limit: number;

  @IsIn(['POS', 'NEU', 'NEG'])
  @IsString()
  label: 'POS' | 'NEU' | 'NEG';
}