class Front {
  constructor() {
    var el = document.querySelector('.page-index');
    if (el === null) return;
    
    this.selector = el.querySelector('.js-selector');

    this.resetSelector();
    this.attachEvents();
  }

  resetSelector() {
    this.selector.selectedIndex = 0;
  }

  attachEvents() {
    this.selector.addEventListener('change', function() {
      window.location = this.value + '.html';
    });
  }
}

export default Front;