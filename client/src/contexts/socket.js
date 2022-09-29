import { createContext } from 'react';

export const SocketContext = createContext();
export const SocketProvider = ({ socket, children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);
