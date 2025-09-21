import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css'; // We'll create this file for styling

function Navigation() {
  return (
    <nav className="navbar">
      <NavLink to="/about" className="nav-link">
        About
      </NavLink>
      <NavLink to="/translator" className="nav-link">
        Translator
      </NavLink>
    </nav>
  );
}

export default Navigation;