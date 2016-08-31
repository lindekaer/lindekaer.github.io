class Front {
  constructor() {
    var el = document.querySelector('.page-index');
    if (el === null) return;
    this.selector = el.querySelector('.js-selector');
    this.topSection = el.querySelector('.js-top');
    this.emoticons = el.querySelector('.js-emoticons');
    this.logo = el.querySelector('.js-logo');
    this.attachEvents();
    this.addFun();
  }

  addFun() {
    this.topSection.addEventListener('click', () => {
      this.emoticons.classList.toggle('hidden');
      this.logo.classList.toggle('hidden');
    });
  }

  attachEvents() {
    this.selector.addEventListener('change', function() {
      const type = this.options[this.selectedIndex].getAttribute('data-type');
      if (type === 'article') return window.location = this.value + '.html';
      if (type === 'slides') return window.location = this.value;
      if (type === 'project') return window.location = this.value;
    });
  }
}

export default Front;
