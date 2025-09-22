import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="App-header">
      <h1>CommUnique 🎧</h1>
      <p>Made by the community , for the community</p>
      <Link to="/translator">Let's continue</Link>
    </div>
  );
}

export default AboutPage;