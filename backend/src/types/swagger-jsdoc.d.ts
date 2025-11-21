declare module 'swagger-jsdoc' {
  interface SwaggerDefinition {
    openapi?: string;
    info: {
      title: string;
      version: string;
      description?: string;
    };
    servers?: Array<{
      url: string;
      description?: string;
    }>;
    components?: {
      securitySchemes?: Record<string, unknown>;
    };
    security?: Array<Record<string, string[]>>;
  }

  interface Options {
    definition?: SwaggerDefinition;
    swaggerDefinition?: SwaggerDefinition;
    apis: string[];
  }

  function swaggerJSDoc(options: Options): Record<string, unknown>;

  export = swaggerJSDoc;
}
