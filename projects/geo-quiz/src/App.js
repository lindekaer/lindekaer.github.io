import React, { Component } from 'react';
import Game from './Game.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <main>
        <nav className="navbar navbar-inverse">
          <div className="navbar-header">
            <a className="navbar-brand" href="/">Geo Quiz</a>
          </div>
        </nav>
        <div className="container">
          <div className="row">
            <div className="col-md-4 col-md-offset-4 text-center">
              <Game data= {this.props.data}/>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default App;
