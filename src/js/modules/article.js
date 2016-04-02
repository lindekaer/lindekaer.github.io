import { toMiles } from '../utils';

class Article {
  constructor() {
    var el = document.querySelector('.page-article');
    if (el === null) return;
    
    this.article = el.querySelector('div.article');

    this.animateArticle();
    // this.enableTooltips();
  }

  animateArticle() {
    this.article.classList.add('active');
  }

  enableTooltips() {
    // Find all paragraphs in the DOM
    var paragraphs = document.querySelectorAll('p');
    for (let p of Array.apply(null, paragraphs)) {

      // Store the text content
      var text = p.textContent;

      // Setup regex and array to hold indices of all occurences
      var regex = /(\s)(kilometer)(s)?/gi
      var indices = [];
      var result;

      // Substring match text until no more matches (push these indeces to the array)
      while ((result = regex.exec(text))) {
        indices.push(result.index);
      }
    
      // Iterate through the indices
      for (let index of indices) {
        var origIndex = index;
        
        // Move backwards in the string until you find a space
        index--;
        while(text[index] !== ' ') {
          index--;
        }

        // Store the found number of km
        var km = text.slice(index + 1, origIndex);

        var insertStartIndex = index;
        index = origIndex;
          
        index++;
        while(text[index] !== ' ' || text[index] !== '.') {
          index++;
        }

        var insertEndIndex = index;
        
        // Inser the tooltip HTML and print to DOM
        var firstPart = text.slice(0, insertStartIndex);
        var midPart   = `<span class="hint--bottom" data-hint="${parseInt(toMiles(km))} miles">${text.slice(insertStartIndex, insertEndIndex)}</span>`;
        var lastPart  = text.slice(insertEndIndex, text.length)

        p.innerHTML = firstPart + ' ' + midPart + lastPart;
      }
    }
  }
}

export default Article;