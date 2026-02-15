import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../auth/authContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let isCancelled = false;
    let socket = null;

    const connectSocket = async () => {
      const token = await getAccessToken();
      if (!token || isCancelled) return;

      socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      socket.on('connect', () => {
        if (!isCancelled) setIsConnected(true);
      });
      socket.on('disconnect', () => {
        if (!isCancelled) setIsConnected(false);
      });
      socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });

      if (!isCancelled) {
        socketRef.current = socket;
      } else {
        socket.disconnect();
      }
    };

    connectSocket();

    return () => {
      isCancelled = true;
      if (socket) {
        socket.disconnect();
      }
      if (socketRef.current === socket) {
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
