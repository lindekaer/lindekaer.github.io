import { isMobile } from '../utils'

class LazyLoad {
  constructor(images) {
    this.images = Array.apply(null, images)
    this.load()
  }

  load() {
    for (let img of this.images) {
      var src
      if (img.getAttribute('data-src').indexOf('http') === -1) {
        src = !isMobile()
          ? `frontend/dist/images/article/desktop/${img.getAttribute('data-src')}`
          : `frontend/dist/images/article/mobile/${img.getAttribute('data-src')}`
      } else {
        src = img.getAttribute('data-src')
      }
      img.setAttribute('src', src)
      img.onload = function () {
        img.removeAttribute('data-src')
      }
    }
  }

}

export default LazyLoad
