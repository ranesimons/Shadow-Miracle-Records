// next-auth.d.ts
import { Session } from 'next-auth';
import { NextApiRequest } from 'next';

declare module 'next' {
  interface NextApiRequest {
    session?: Session;
  }
}
