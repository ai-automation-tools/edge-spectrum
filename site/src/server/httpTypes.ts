import type { IncomingMessage, ServerResponse } from 'node:http';

/** The Node.js helpers supplied by Vercel, without installing its build runtime.
 * https://vercel.com/docs/functions/runtimes/node-js#node.js-helpers
 */
export interface ApiRequest extends IncomingMessage {
  body?: any;
  query: Record<string, string | string[] | undefined>;
}

/** What a framework-agnostic route function hands back to its Express or Vercel adapter. */
export interface RouteResult {
  status: number;
  body: unknown;
}

export interface ApiResponse extends ServerResponse {
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
  send(body: string | object | Buffer): ApiResponse;
}
