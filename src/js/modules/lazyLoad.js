import { isMobile } from '../utils';

class LazyLoad {
  constructor(images) {
    this.images = Array.apply(null, images);
    this.checkIfInView();
    this.initEvents();
  }

  initEvents() {
    document.addEventListener('DOMContentLoaded', this.checkIfInView.bind(this));
    window.onscroll = this.checkIfInView.bind(this);
  }

  checkIfInView() {
    for (let img of this.images) {
      if (this.isInView(img)) {
        this.load(img);
      }
    }
  }

  isInView(img) {
    const c = img.getBoundingClientRect();
    return ((c.top >= 0 && c.left >= 0 && c.top) <= (window.innerHeight || document.documentElement.clientHeight));
  }

  load(img) {
    var src = !isMobile() 
      ? `img/article/desktop/${img.getAttribute('data-src')}` 
      : `img/article/mobile/${img.getAttribute('data-src')}`;
    img.setAttribute('src', src);
    img.onload = function() {
      img.removeAttribute('data-src');
    }
    this.remove(img);
  }

  remove(img) {
    const index = this.images.indexOf(img);
    this.images.splice(index, 1);
  }

}

export default LazyLoad;
