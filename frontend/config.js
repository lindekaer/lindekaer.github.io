/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import path from 'path'
import moment from 'moment'
import fs from 'fs'
import marked from 'marked'
import cheerio from 'cheerio'
import { slugify } from './utils'

/*
-----------------------------------------------------------------------------------
|
| Configuration
|
-----------------------------------------------------------------------------------
*/

class Article {
  constructor (title, category, date) {
    this.title = title
    this.category = category
    this.date = `${moment(date).format('MMMM Do, YYYY')}`
    this.author = 'Theodor Lindekaer'
    this.slug = slugify(title)

    const keywords = {
      'Development': 'development, programming, technology, IT, computer, algorithm, tutorial, guide, Docker, Node, Javascript, HTML, CSS',
      'Travel': 'travel, adventure, hiking, outdoor, gear, experience, friends, food',
      'Sport': 'sport, adventure, training, workout, challenge, fun',
      'Personal': 'personal, life, experience, me, job, hobby, travel, interest'
    }

    const articleHTML = marked(fs.readFileSync(path.join(__dirname, '..', 'content', 'articles', `${this.slug}.md`)).toString())
    const $ = cheerio.load(articleHTML)
    const description = $('p').slice(0, 1).text()

    this.description = description || ''
    this.keywords = keywords[category] || ''
  }
}

class Slides {
  constructor (title) {
    this.title = title
    this.path = `/slides/${slugify(title)}`
  }
}

const articles = [
  new Article('Fit with Git', 'Development', '2016-03-20'),
  new Article('Docker 101', 'Development', '2016-03-17'),
  new Article('Dynamically updating nested properties in MongoDB', 'Development', '2016-03-03'),
  new Article('Hiking in Söderåsen 🇸🇪', 'Travel', '2016-03-29'),
  new Article('Camino de Santiago 🇪🇸🇫🇷', 'Travel', '2016-04-02'),
  new Article('Upplandsleden 🇸🇪', 'Travel', '2016-04-18'),
  new Article('Hunting for Dracula 🇷🇴', 'Travel', '2016-05-13'),
  new Article('GR 6 Barcelona to Montserrat 🇪🇸', 'Travel', '2016-06-05'),
  new Article('GR 20 Calenzana to Conca 🇫🇷', 'Travel', '2016-07-10'),
  new Article('Tour de Mont Blanc 🇫🇷🇮🇹🇨🇭', 'Travel', '2016-08-30'),
  new Article('Hiking in Tatry Roháče 🇸🇰', 'Travel', '2016-09-05'),
  new Article('Serve private content from AWS S3', 'Development', '2016-11-01'),
  new Article('DynamoDB pagination', 'Development', '2016-11-14'),
  new Article('About me', 'Personal', '2016-11-20'),
  // new Article('Getting started with AWS Lambda', 'Development', '2016-11-27'),
  new Article('WebRTC explained', 'Development', '2016-12-12'),
  new Article('Running a local DynamoDB', 'Development', '2016-12-21'),
  new Article('Batch process files in Bash', 'Development', '2017-01-30')
  // new Article('Async error handling in Node', 'Development', '2016-11-23')
]

const slides = [
  new Slides('Programming 101')
]

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export { articles, slides }
