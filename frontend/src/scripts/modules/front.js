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
    this.init()
  }

  init () {
    window.app = new Vue({
      el: '#app',
      data: {
        query: '',
        searchHasResults: true,
        dropdownIsShown: false,
        articles: window.articles
      },
      computed: {
        filteredArticles: function () {
          const result = this.articles.filter((a) => {
            return a.title.toLowerCase().indexOf(this.query.toLowerCase()) !== -1
          })
          this.searchHasResults = result.length !== 0
          return result.reverse()
        }
      },
      methods: {
        getArticleUrl: (slug) => slug + '.html',
        getArticleCategory: (cat) => `category-${cat.toLowerCase()}`,
        toggleDropdown: function () {
          if (this.dropdownIsShown) this.hideDropdown()
          else this.showDropdown()
        },
        showDropdown,
        hideDropdown
      }
    })
  }
}

function showDropdown () {
  this.dropdownIsShown = !this.dropdownIsShown
  const dropDown = this.$el.querySelector('.js-dropdown')
  const items = dropDown.querySelectorAll('a')

  dynamics.animate(dropDown, {
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

function hideDropdown () {
  this.dropdownIsShown = !this.dropdownIsShown
  const dropDown = this.$el.querySelector('.js-dropdown')
  dynamics.animate(dropDown, {
    opacity: 0,
    scale: 0.1
  }, {
    type: dynamics.easeInOut,
    duration: 300,
    friction: 100
  })
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default Front
