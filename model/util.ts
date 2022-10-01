import { Session as ISession } from 'express-session';

export interface PromiseExecutor<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export interface LookupResolveValue {
  address: string;
  name: string;
  state: number;
}

export interface Lookup extends PromiseExecutor<LookupResolveValue> {
  name?: string;
  address?: string;
}

export interface Session extends ISession {
  socketId: string;
  conversation: any;
}
