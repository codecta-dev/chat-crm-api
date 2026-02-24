import { Params } from "nestjs-pino";

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        singleLine: true,
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname,context,http,statusCode',
        levelFirst: true,
        messageFormat: '{if context}{context} | {end}{if http}{http} {end}{msg}{end}{if statusCode}{statusCode}{end}',
        customColors: 'error:red,info:cyan,debug:blue,warn:yellow',
      },
    } : undefined,
    customProps: (req, res) => ({
      http: `[${req.url}, ${req.method}]`,
      statusCode: ` - ${res.statusCode}`,
    }),
  },
};
