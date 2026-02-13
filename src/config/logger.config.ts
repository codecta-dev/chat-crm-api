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
        ignore: 'pid,hostname,context',
        levelFirst: true,
        messageFormat: '{if context}{context} |{end}{http} {msg}{if statusCode}{statusCode}{end}',
        customColors: 'error:red,info:cyan,debug:blue,warn:yellow',
      },
    } : undefined,
    customProps: (req, res) => ({
      http: `${req.method} ${req.url}`,
      statusCode: ` - ${res.statusCode}`,
    }),
  },
};
