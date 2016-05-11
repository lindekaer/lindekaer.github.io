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
      const type = this.options[this.selectedIndex].getAttribute('data-type');
      if (type === 'article') return window.location = this.value + '.html';  
      if (type === 'slide') return window.location = this.value;
    });
  }
}

export default Front;