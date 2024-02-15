import React, { useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = async () => {
    const url = `http://localhost:80/search?url=${inputValue}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <div>
      Repo url: <input type="text" value={inputValue} onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Go</button>
      <br />
      {data && <p> Similar to {inputValue} </p>}
      {(data || []).map(({ name, url, count }) => (
        <div key={name}>
          <p><a href={url}>{name}</a>: {count} common contributors</p>
        </div>
      ))}
    </div>
  )
}

export default App;
