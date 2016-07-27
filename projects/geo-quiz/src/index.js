import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// load in JSON data from file
var data;

var request = new XMLHttpRequest();
request.onload = reqListener;
request.open('get', '/data/data.json', true);
request.send();

function reqListener(e) {
  var data = JSON.parse(this.responseText);
  ReactDOM.render(
    <App data = {data} />,
    document.getElementById('root')
  );
}

