import { toMiles } from '../utils';

class Article {
  constructor() {
    var el = document.querySelector('.page-article');
    if (el === null) return;
    
    this.article = el.querySelector('div.article');

    this.animateArticle();
    this.enableTooltips();
  }

  animateArticle() {
    this.article.classList.add('active');
  }

  enableTooltips() {
    // Find all paragraphs in the DOM
    var paragraphs = document.querySelectorAll('p');
    for (let p of Array.apply(null, paragraphs)) {

      // Setup regex and array to hold indices of all occurences
      var regex = /(\s)(kilometer)(s)?/gi
      var numberOfOccurences = 0;

      // Substring match text until no more matches (push these indeces to the array)
      while ((result = regex.exec(p.innerHTML))) numberOfOccurences++;

      for (var i = 0; i < numberOfOccurences; i++) {
        var indices = [];
        var result;
  
        while ((result = regex.exec(p.innerHTML))) {
          indices.push(result.index);
        }

        var index = indices[i];
        var origIndex = index;
        var text = p.innerHTML;

        // Move backwards in the string until you find a space
        index--;
        while(text[index] !== ' ' && text[index] !== undefined) {
          index--;
        }

        // Store the found number of km
        var km = parseInt(text.slice(index + 1, origIndex));
        if (isNaN(km)) continue;

        var insertStartIndex = index;
        index = origIndex;
          
        index++;
        while(text[index] !== ' ' && text[index] !== undefined) {
          index++;
        }

        var insertEndIndex = index;

        // Inser the tooltip HTML and print to DOM
        var firstPart = text.slice(0, insertStartIndex);
        var midPart   = `<span class="hint--bottom" data-hint="${toMiles(km)} miles">${text.slice(insertStartIndex, insertEndIndex)}</span>`;
        var lastPart  = text.slice(insertEndIndex, text.length);
        p.innerHTML = firstPart + ' ' + midPart + lastPart;
      }

    }
  }

}

export default Article;