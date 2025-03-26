import router from "./router/index";
import { useRoutes } from "react-router-dom";
import { ConfigProvider, ThemeConfig } from "antd";
import './App.css';


function App() {
  const theme: ThemeConfig = {
    token: {
      colorPrimary: '#1677ff',
    },
  }
  return (
    <ConfigProvider theme={theme}>
      <div className="App">
        {useRoutes(router)}
      </div>
    </ConfigProvider>
  );
}

export default App;
