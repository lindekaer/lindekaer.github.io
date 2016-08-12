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
      game: {
        previouslyUsed: [],
        toBeGuessed: null,
        options: null
      }
    },
    this.data = props.data
  }

  componentWillMount() {
    this.prepareGame();
  }

  prepareGame() {
    // Make a copy of all data
    var copyData = this.data;

    // Pick a random capital
    var randomIndex = Math.floor(Math.random() * copyData.length);
    var capital     = copyData[randomIndex].capital;
    var country     = copyData[randomIndex];
    
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
    countries.push(country);

    console.log(this.state.game);
    var previouslyUsed = this.state.game.previouslyUsed.slice().push(country);
    console.log(this.state.game);

    this.setState({
      game: {
        previouslyUsed: previouslyUsed,
        toBeGuessed: country,
        options: countries
      }
    });

    console.log(this.state.game);
  }

  render() {
    return (
      <div>
        {this.renderGame()}
        {this.renderGameStats()}
      </div>
    );
  }

  renderGame() {
    return (
      <div>
        <p className='lead'>{this.state.game.toBeGuessed.capital} is the capital of ... ?</p>
        {this.renderButtons(this.state.game.options)}
      </div>
    )
  }

  renderButtons(options) {
    shuffle(options);
    return options.map(c => <button className="btn btn-primary btn-lg btn-block" onClick={this.selectCountry.bind(this)}> {c.name}</button>)
  }

  selectCountry(e) {
    var button = e.currentTarget;
    if (e.currentTarget.textContent === this.state.game.toBeGuessed) alert('Correct!');


    // ...
    
    // this.prepareGame();
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
