
import React from "react";

export const SocketContext = React.createContext();
export const SocketProvider = ({socket, children}) => (
    <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
)