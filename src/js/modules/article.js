class Front {
  constructor() {
    var el = document.querySelector('.page-article');
    if (el === null) return;
    
    this.article = el.querySelector('div.article');

    this.animateArticle();
  }

  animateArticle() {
    this.article.classList.add('active');
  }
}

export default Front;