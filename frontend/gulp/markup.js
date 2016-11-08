/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import gulp from 'gulp'
import path from 'path'
import inline from 'gulp-inline'
import htmlmin from 'gulp-htmlmin'
import rename from 'gulp-rename'
import plumber from 'gulp-plumber'
import jade from 'gulp-jade'
import cheerio from 'gulp-cheerio'
import fs from 'fs'
import marked from 'marked'
import { articles, slides } from '../config'
import { errHandler, slugify } from '../utils'

/*
-----------------------------------------------------------------------------------
|
| Markup tasks
|
-----------------------------------------------------------------------------------
*/

const markupTasks = {}

markupTasks.renderArticles = (cb) => {
  const startIndex = 0
  iterateArticles(articles, startIndex, cb)
}

markupTasks.renderIndex = (cb) => {
  render('index', 'index', { articles, slides }, cb)
}

markupTasks.htmlSetAlt = () => {
  return gulp.src(path.join(__dirname, '..', '..', '*.html'))
    .pipe(cheerio(($, file) => {
      $('img').each((index, el) => {
        var title = $(el).attr('title')
        $(el).attr('alt', title)
      })
    }))
    .pipe(gulp.dest(path.join(__dirname, '..', '..')))
}

markupTasks.htmlSetCaption = () => {
  return gulp.src(path.join(__dirname, '..', '..', '*.html'))
  .pipe(cheerio(($, file) => {
    $('.media').each((index, el) => {
      var numberOfChildren = $(el).children().length
      if (numberOfChildren > 1) return
      var text = $(el).find('img').attr('title')
      $(el).append('<p class="media__caption">' + text + '</p>')
    })
  }))
  .pipe(gulp.dest(path.join(__dirname, '..', '..')))
}

markupTasks.htmlSetSrc = () => {
  return gulp.src(path.join(__dirname, '..', '..', '*.html'))
  .pipe(cheerio(($, file) => {
    $('.media__image').each((index, el) => {
      var fileName = $(el).attr('data-src')
      if (fileName.indexOf('http') === -1) {
        fileName = slugify($('h1').first().text()) + '.' + fileName
      }
      $(el).attr('data-src', fileName)
    })
  }))
  .pipe(gulp.dest(path.join(__dirname, '..', '..')))
}

markupTasks.htmlSetTableOfContents = () => {
  return gulp.src(path.join(__dirname, '..', '..', '*.html'))
  .pipe(cheerio(($, file) => {
    if (!$('.table-of-contents').length) return
    $('h2, h3, h4, h5, h6').each((index, el) => {
      // Add unique class to all headings (anchor for scrolling)
      const text = $(el).text()
      $(el).addClass('jump-' + slugify(text))

      // Add table-of-contents elements to the DOM
      const headingNumber = $(el)[0].tagName.split('h')[1]
      const $tableEl = $('<li><a></a></li>')
      $tableEl.find('a').attr('href', '#')
      $tableEl.find('a').attr('data-jump', slugify(text))
      $tableEl.find('a').addClass(`number-${headingNumber}`)
      // Add a dash to all sub-headings in the table
      if (headingNumber !== '2') $tableEl.find('a').text('- ' + text)
      else $tableEl.find('a').text(text)
      $('.table-of-contents').append($tableEl)
    })
  }))
  .pipe(gulp.dest(path.join(__dirname, '..', '..')))
}

/*
-----------------------------------------------------------------------------------
|
| Utility functions
|
-----------------------------------------------------------------------------------
*/

function iterateArticles (articles, index, cb) {
  if (index === articles.length) return cb()
  const article = articles[index]
  // Read the raw markdown file
  const rawMarkdown = fs.readFileSync(`../../content/articles/${article.slug}.md`).toString()
  // Store the rendered HTML on the article object
  article.content = marked(rawMarkdown)
  // Create the locals object the with article data to pass to the template
  const locals = { article }
  render('article', article.slug, locals, () => {
    iterateArticles(articles, ++index, cb)
  })
}

function render (template, name, locals, cb) {
  return gulp.src(path.join(__dirname, '..', 'src', 'markup', `${template}.jade`))
    .pipe(plumber(errHandler))
    .pipe(jade({ locals }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(inline({
      base: path.join(__dirname, '..', '..'),
      disabledTypes: ['svg', 'img', 'js'],
      ignore: ['assets/css/dist-vendor.min.css']
    }))
    .pipe(rename({
      basename: name,
      extname: '.html'
    }))
    .pipe(gulp.dest(path.join(__dirname, '..', '..')))
    .on('end', cb)
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default markupTasks
