import { isMobile } from '../utils'
import LazyLoad from './lazyLoad'

class Article {
  constructor () {
    var el = document.querySelector('.page-article')
    if (el === null) return
    this.code = el.querySelectorAll('pre')
    this.article = el.querySelector('article.article')
    this.lazyLoadImages()
    this.highlightCode()

    if (!isMobile()) {
      this.enableLightbox()
    }
  }

  lazyLoadImages () {
    var images = document.querySelectorAll('img[data-src]')
    new LazyLoad(images)
  }

  highlightCode () {
  }

  enableLightbox () {
    var lightbox = new Lightbox()
    lightbox.load()
    for (let img of Array.apply(null, document.querySelectorAll('.media__image'))) {
      img.setAttribute('data-jslghtbx', '')
      img.addEventListener('click', () => {
        lightbox.open(img.src)
      })
    }
  }
}

export default Article
