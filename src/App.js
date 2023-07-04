import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers';
import Card from './Card';
function App() {
  return (
    <div className="App">
      <div className='App-container'>
        <div className='card-container'>
          <Card/>
        </div>
      </div>
    </div>
  );
}

export default App;
