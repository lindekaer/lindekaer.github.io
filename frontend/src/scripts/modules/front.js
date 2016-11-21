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
    this.button = el.querySelector('.js-button')
    this.dropDown = el.querySelector('.js-dropdown')
    this.articleGrid = el.querySelector('.js-grid')
    this.noResults = el.querySelector('.js-no-results')
    this.articles = el.querySelectorAll('.js-grid-item')
    this.search = el.querySelector('.js-search')
    this.dropdownIsShown = false
    this.addEvents()
  }

  addEvents () {
    this.search.addEventListener('keyup', debounce(() => {
      const query = this.search.value
      this.filterArticles(query)
    }, 300))

    this.button.addEventListener('click', this.toggleDropdown.bind(this))
  }

  filterArticles (query) {
    let numFound = 0
    for (const article of this.articles) {
      const title = article.getAttribute('data-title').toLowerCase()
      query = query.toLowerCase()
      if (title.indexOf(query) === -1) {
        article.classList.add('hidden')
      } else {
        numFound++
        article.classList.remove('hidden')
      }
    }
    // If no result show message, else reset to initial state
    if (numFound === 0) {
      this.articleGrid.classList.add('no-results')
      this.noResults.classList.remove('hidden')
    } else {
      this.articleGrid.classList.remove('no-results')
      this.noResults.classList.add('hidden')
    }
  }

  toggleDropdown () {
    var items = this.dropDown.querySelectorAll('a')

    if (this.dropdownIsShown) {
      this.dropdownIsShown = !this.dropdownIsShown
      dynamics.animate(this.dropDown, {
        opacity: 0,
        scale: 0.1
      }, {
        type: dynamics.easeInOut,
        duration: 300,
        friction: 100
      })
    } else {
      this.dropdownIsShown = !this.dropdownIsShown
      dynamics.animate(this.dropDown, {
        opacity: 1,
        scale: 1
      }, {
        type: dynamics.spring,
        frequency: 200,
        friction: 400,
        duration: 800
      })
      // Animate each line individually
      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        // Define initial properties
        dynamics.css(item, {
          opacity: 0,
          translateY: 20
        })
        // Animate to final properties
        dynamics.animate(item, {
          opacity: 1,
          translateY: 0
        }, {
          type: dynamics.spring,
          frequency: 300,
          friction: 435,
          duration: 1000,
          delay: 100 + i * 40
        })
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
