import React from 'react';
import logo from './logo.svg';
import './App.css';
import ContxtSdk from '@ndustrial/contxt-sdk';

const contxtSdk = new ContxtSdk({
  config: {
    auth: {
      clientId: 'nC2Tp9H45CBmBzX60eH3A3psGqE2K1KA'
    }
  },
  sessionType: 'auth0WebAuth'
});

contxtSdk.facilities.getAll().then((facilities) => {
  console.log(`all of my facilities: ${JSON.stringify(facilities)}`);
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
