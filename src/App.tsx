import router from "./router/index";
import { useRoutes } from "react-router-dom";
import './App.css';
import { ConfigProvider } from "antd";


function App() {
  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#1677ff',
      },
    }}>
      <div className="App">
        {useRoutes(router)}
      </div>
    </ConfigProvider>
  );
}

export default App;
