import { IsString } from "class-validator";

export class WebhookQuery {
  @IsString()
  'hub.mode': string;

  @IsString()
  'hub.challenge': string;

  @IsString()
  'hub.verify_token': string;
}