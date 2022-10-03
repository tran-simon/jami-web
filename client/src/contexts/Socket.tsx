import { createContext, PropsWithChildren } from 'react';
import { Socket } from 'socket.io-client';

type ISocketContext = Socket;
export const SocketContext = createContext<ISocketContext | undefined>(undefined);

type SocketProviderProps = PropsWithChildren<{
  socket: Socket;
}>;
export const SocketProvider = ({ socket, children }: SocketProviderProps) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);
