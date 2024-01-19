import { ReactNode } from 'react';
import { SocketProvider } from './createContext';

const AppContextProviders = ({ children }: { children: ReactNode }) => (
  <SocketProvider>{children}</SocketProvider>
);

export default AppContextProviders;