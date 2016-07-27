import React, { Component } from 'react';
import { shuffle } from './utils.js'
import './Game.css';

class Game extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      hasStarted: false,
      correct: 0,
      lives: 3,
      usedCapitals: [],
      game: {
        toBeGuessed: null,
        options: null
      }
    },
    this.data = props.data
  }

  render() {
    return (
      <div>
        {this.renderHeadline()}
        {this.renderGame()}
        {this.renderGameStats()}
      </div>
    );
  }

  renderHeadline() {
    if (!this.state.hasStarted) {
      return (
        <h2>Pick a game type</h2>
      )  
    }
  }
  
  renderGame() {
    if (!this.state.hasStarted) {
      return (
        <div>
          <button className="btn btn-primary btn-block" onClick={this.pickGameType.bind(this, 'capital')}>Match capital and country</button>
          <button className="btn btn-primary btn-block" onClick={this.pickGameType.bind(this, 'flag')}>Match flag and country</button>
        </div>
      )  
    } else {
      return this.startGame()
    }
  }

  startGame() {
    if (this.state.type === 'capital') {
      
      // Make a copy of all data
      var copyData = this.data;

      // Pick a random capital
      var randomIndex = Math.floor(Math.random() * copyData.length);
      var capital     = copyData[randomIndex].capital;
      this.state.game.toBeGuessed = copyData[randomIndex];
      
      // Remove country to avoid it being selected as an option twice
      copyData.splice(randomIndex, 1);

      // Pick three random countries
      var countries = [];
      for (let i = 0; i < 3; i++) {
        randomIndex = Math.floor(Math.random() * copyData.length);
        var randomCountry = copyData[randomIndex];
        copyData.splice(randomIndex, 1);
        countries.push(randomCountry);
      }

      // Add the correct country to the possibilites
      countries.push(this.state.game.toBeGuessed);

      return (
        <div>
          <p className='lead'>{capital} is the capital of ... ?</p>
          {this.renderButtons(countries)}
        </div>
      )

    }
  }

  renderButtons(countries) {
    shuffle(countries);
    return countries.map(c => <button className="btn btn-primary btn-lg btn-block" onClick={this.selectCountry.bind(this)}><img src={`/material-ui/img/flags/${c.code}.png`}/> {c.name}</button>)
  }

  selectCountry(e) {
    var button = e.currentTarget;
    if (e.currentTarget.textContent === this.state.game.toBeGuessed) alert('Correct!');
  }

  pickGameType(selectedType) {
    this.setState({
      type: selectedType,
      hasStarted: true
    });
  }

  renderGameStats() {
    if (this.state.hasStarted) {
      return (
        <div>
          <p>You have {this.state.correct} correct answers</p>
          <p>You have {this.state.lives} lives left</p>
        </div>
      )  
    }
  }

}

export default Game;
