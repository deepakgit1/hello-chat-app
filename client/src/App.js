import { Route, Routes } from 'react-router-dom';
import './App.css';
import Chatpage from './pages/Chatpage';
import Homepage from './pages/Homepage';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<Homepage/>} exact/>
      <Route path="/chats" element={<Chatpage/>}/>
      </Routes>
    </div>
  );
}

export default App;
