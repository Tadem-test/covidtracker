import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">Covid-19 Tracker</Link>
        <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="navbar-item">
          <Link to="/chart" className="nav-link">Charts</Link>
          </li>
          <li className="navbar-item">
          <Link to="/table" className="nav-link">Tables</Link>
          </li>
          <li className="navbar-item">
          <Link to="/tablecd" className="nav-link">Tables Country Data</Link>
          </li>
          <li className="navbar-item">
          <Link to="/update" className="nav-link">Update</Link>
          </li>
        </ul>
        </div>
      </nav>
    );
  }
}