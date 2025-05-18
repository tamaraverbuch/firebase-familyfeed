


declare namespace NodeJS {
  interface ProcessEnv {
    FIREBASE_SERVICE_ACCOUNT_KEY?: string;
    FIREBASE_STORAGE_BUCKET?: string;
    OPENAI_API_KEY?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  
  }
}

declare module 'multer' {
  import { Request } from 'express';
  

  export function memoryStorage(): any;
  export function diskStorage(options: { destination?: string | ((req: Request, file: any, callback: (error: Error | null, destination: string) => void) => void), filename?: (req: Request, file: any, callback: (error: Error | null, filename: string) => void) => void }): any;
  
  function multer(options?: multer.Options): multer.Multer;
  
  namespace multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
    
    interface Options {
      dest?: string;
      storage?: any;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      fileFilter?(req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void): void;
      preservePath?: boolean;
    }
    
    interface Multer {
      single(fieldname: string): any;
      array(fieldname: string, maxCount?: number): any;
      fields(fields: Array<{ name: string; maxCount?: number }>): any;
      none(): any;
    }
  }

  export = multer;
}