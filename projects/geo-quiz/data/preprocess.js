var fs = require('fs');

var countries   = JSON.parse(fs.readFileSync('countries.json', 'utf-8'));
var capitals    = JSON.parse(fs.readFileSync('capitals.json', 'utf-8'));
var populations = JSON.parse(fs.readFileSync('populations.json', 'utf-8'));

for (country of countries) {
  country.capital = capitals[country.code];
  for (population of populations) {
    if (population.code === country.code) {
      country.population = population.count;
    }
  }
}


fs.writeFileSync('./data.json', JSON.stringify(countries));