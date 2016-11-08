/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import { debounce } from '../utils'

/*
-----------------------------------------------------------------------------------
|
| Front page module
|
-----------------------------------------------------------------------------------
*/

class Front {
  constructor () {
    var el = document.querySelector('.page-index')
    if (el === null) return
    this.articles = el.querySelectorAll('.js-article')
    this.search = el.querySelector('.js-search')
    this.addEvents()
  }

  addEvents () {
    this.search.addEventListener('keyup', debounce(() => {
      const query = this.search.value
      this.filterArticles(query)
    }, 300))
  }

  filterArticles (query) {
    for (const article of this.articles) {
      const title = article.getAttribute('data-title').toLowerCase()
      query = query.toLowerCase()
      if (title.indexOf(query) === -1) {
        article.classList.add('hidden')
      } else {
        article.classList.remove('hidden')
      }
    }
  }
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default Front
