import { isMobile } from '../utils';

class LazyLoad {
  constructor(images) {
    this.images = Array.apply(null, images);
    this.load();
  }

  load() {
    for (let img of this.images) {
      var src = !isMobile() 
        ? `img/article/desktop/${img.getAttribute('data-src')}` 
        : `img/article/mobile/${img.getAttribute('data-src')}`;
      img.setAttribute('src', src);
      img.onload = function() {
        img.removeAttribute('data-src');
      }
    }
  }
  
}

export default LazyLoad;
