import { toMiles, toFahrenheit, isMobile } from '../utils';
import LazyLoad from './lazyLoad';

class Article {
  constructor() {
    var el = document.querySelector('.page-article');
    if (el === null) return;
    
    this.article = el.querySelector('div.article');

    this.animateArticle();
    this.lazyLoadImages();
    this.enableTableOfContents();
   
    if (!isMobile()) {
      this.enableTooltips('km-to-miles');
      this.enableTooltips('celcius-to-fahrenheit');  
    }
    
  }

  animateArticle() {
    this.article.classList.add('active');
  }

  lazyLoadImages() {
    var images = document.querySelectorAll('img[data-src]');
    new LazyLoad(images);
  }

  enableTooltips(type) {
    // Find all paragraphs in the DOM
    var paragraphs = document.querySelectorAll('p');
    for (let p of Array.apply(null, paragraphs)) {

      // Setup regex and array to hold indices of all occurences
      if (type === 'km-to-miles') var regex = /[0-9]*\s(kilometer)(s)?/gi;
      if (type === 'celcius-to-fahrenheit') var regex = /[0-9]*\s(\u2103)/gi;
      
      var result;
      var numberOfOccurences = 0;

      // Substring match text until no more matches (push these indices to the array)
      while ((result = regex.exec(p.innerHTML))) numberOfOccurences++;


      for (var i = 0; i < numberOfOccurences; i++) {
        var indices = [];
        var result;
        var text = p.innerHTML;
  
        while ((result = regex.exec(p.innerHTML))) {
          indices.push({
            startIndex: result.index,
            endIndex: result.index + result[0].length
          });
        }

        var index = indices[i].startIndex;
        var startIndex = indices[i].startIndex;
        var endIndex = indices[i].endIndex;

        // Move ahead until we find a space (e.g. "200 kilometers")
        while(text[index] !== ' ') {
          index++;
        }

        // Store the found number (can be fx km or celcius degrees)
        var num = parseInt(text.slice(startIndex, index));
        if (isNaN(num)) continue;

        // Inser the tooltip HTML and print to DOM
        if (type === 'km-to-miles') var unit = `${toMiles(num)} miles`;
        if (type === 'celcius-to-fahrenheit') var unit = `${toFahrenheit(num)} \u2109`;
   
        var firstPart = text.slice(0, startIndex);
        var midPart   = `<span class="hint--bottom" data-hint="${unit}">${text.slice(startIndex, endIndex)}</span>`;
        var lastPart  = text.slice(endIndex, text.length);
        p.innerHTML = firstPart + midPart + lastPart;
      }
    }
  }

  enableTableOfContents() {
    var table = document.querySelector('.table-of-contents');
    if (!table) return;
    var tableLinks = Array.apply(null, table.querySelectorAll('a'));

    for (let tableLink of tableLinks) {
      tableLink.addEventListener('click', function(e) {
        e.preventDefault();
        Jump(`.jump-${this.getAttribute('data-jump')}`, {
          offset: -25
        })
      });
    }

  }

}

export default Article;