import router from "./router/index";
import { useRoutes } from "react-router-dom";
import './App.css';


function App() {
  return (
    <div className="App">
      {useRoutes(router)}
    </div>
  );
}

export default App;
