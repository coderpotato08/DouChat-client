import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/index'
import './index.css';
import './static/iconfont.css'
import App from './App';
import { SocketProvider } from '@store/context/createContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<BrowserRouter>
  <Provider store={store}>
    <SocketProvider>
      <App />
    </SocketProvider>
  </Provider>
</BrowserRouter>);
