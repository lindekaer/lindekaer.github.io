/*
-----------------------------------------------------------------------------------
|
| Dependencies
|
-----------------------------------------------------------------------------------
*/

'use strict';

// Enable ES2015 features
require('babel-core/register');

var fs               = require('fs');
var del              = require('del');
var gulp             = require('gulp');
var md               = require('marked');
var runSequence      = require('run-sequence');
var source           = require('vinyl-source-stream');
var buffer           = require('vinyl-buffer')
var browserify       = require('browserify');
var rollupify        = require('rollupify');
var babelify         = require('babelify');
var sass             = require('gulp-sass');
var autoprefixer     = require('gulp-autoprefixer');
var csso             = require('gulp-csso');
var htmlmin          = require('gulp-htmlmin');
var inline           = require('gulp-inline');
var plumber          = require('gulp-plumber');
var rename           = require('gulp-rename');
var cheerio          = require('gulp-cheerio');
var jade             = require('gulp-jade');
var concat           = require('gulp-concat');
var uglify           = require('gulp-uglify');
var watch            = require('gulp-watch');
var imagemin         = require('imagemin');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminOptipng  = require('imagemin-optipng');
var browserSync      = require('browser-sync').create();

var errHandler = {
  errorHandler: function(err) {
    console.log(err);
    this.emit('end');
  }
}

/*
-----------------------------------------------------------------------------------
|
| Server
|
-----------------------------------------------------------------------------------
*/

gulp.task('browserSync', function() {
  browserSync.init({
    injectChanges: false,
    server: {
      baseDir: '.'
    }
  });
});

/*
-----------------------------------------------------------------------------------
|
| SASS
|
-----------------------------------------------------------------------------------
*/

gulp.task('sass', function(cb) {
  runSequence('sass:custom', 'sass:inlineStyles', cb);
});

gulp.task('sass:custom', function() {
  return gulp.src('./src/sass/*.scss')
  .pipe(plumber(errHandler))
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(csso())
  .pipe(rename({
    basename: 'dist',
    suffix: '.min',
    extname: '.css'
  }))
  .pipe(gulp.dest('./assets/css'))
  .pipe(browserSync.stream());
});

gulp.task('sass:inlineStyles', function() {
  gulp.src('./*.html')
  .pipe(inline({
    base: './',
    disabledTypes: ['svg', 'img', 'js'],
    ignore: ['assets/css/dist-vendor.min.css']
  }))
  .pipe(gulp.dest('./'));
});

gulp.task('sass:vendor', function() {
  return gulp.src([
    './node_modules/prismjs/themes/prism-okaidia.css',
    './node_modules/leaflet/dist/leaflet.css',
    './node_modules/hint.css/hint.css'
  ])
  .pipe(plumber(errHandler))
  .pipe(concat('dist-vendor.min.css'))
  .pipe(csso())
  .pipe(gulp.dest('./assets/css'));
});

/*
-----------------------------------------------------------------------------------
|
| JS
|
-----------------------------------------------------------------------------------
*/

gulp.task('js', function() {
  var bundler = browserify('./src/js/app.js', { debug: true })
  .transform(rollupify)
  .transform(babelify, { presets: ['es2015'] });

  return bundler.bundle()
  .on('error', function(err) { console.error(err); this.emit('end'); })
  .pipe(source('dist.min.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('./assets/js'));
});

gulp.task('js:vendor', function() {
  return gulp.src([
    './node_modules/prismjs/prism.js',
    './node_modules/prismjs/components/prism-bash.js',
    './node_modules/leaflet/dist/leaflet.js'
  ])
  .pipe(plumber(errHandler))
  .pipe(concat('dist-vendor.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./assets/js'))
  .pipe(browserSync.stream());
});

/*
-----------------------------------------------------------------------------------
|
| Jade and HTML
|
-----------------------------------------------------------------------------------
*/

gulp.task('jade', function(cb) {
  runSequence(['jade:articles', 'jade:pages'], 'html:enrich', cb);
});

gulp.task('jade:articles', function(cb) {
  runSequence['clean'];
  var config = require('./config.js');
  var articles = config.articles;
  iterate(articles, 0, cb);
});

gulp.task('jade:pages', function(cb) {
  var articles = require('./config.js').articles;
  var categories = new Set();
  for (let article of articles) {
    categories.add(article.category);
  }

  var content = [];

  categories.forEach((category) => {
    content.push({
      name: category,
      articles: []
    });
  });

  articles.forEach((article) => {
    content.forEach((category) => {
      if (category.name === article.category) {
        category.articles.push(article);
      }
    });
  });

  var locals = { 
   content: content
  }

  render('index', 'index', locals, cb);
});

gulp.task('html:enrich', function() {
  return gulp.src('*.html')
  .pipe(cheerio(function ($, file) {
    $('img').each(function(index, el) {
      var title = $(el).attr('title');
      $(el).attr('alt', title);
    });
  }))
  .pipe(gulp.dest('.'));
})

/*
-----------------------------------------------------------------------------------
|
| Images
|
-----------------------------------------------------------------------------------
*/

gulp.task('img:compress', () => {
  runSequence(['img:compress:desktop', 'img:compress:mobile'])
})

gulp.task('img:compress:desktop', () => {
    return gulp.src('./img/article/desktop/*')
    .pipe(imageminOptipng({optimizationLevel: 3})())
    .pipe(imageminJpegtran({progressive: true})())
    .pipe(gulp.dest('./img/article/desktop'));
});

gulp.task('img:compress:mobile', () => {
    return gulp.src('./img/article/mobile/*')
    .pipe(imageminOptipng({optimizationLevel: 3})())
    .pipe(imageminJpegtran({progressive: true})())
    .pipe(gulp.dest('./img/article/mobile'));
});

/*
-----------------------------------------------------------------------------------
|
| Various tasks
|
-----------------------------------------------------------------------------------
*/

gulp.task('clean', function() {
  return del(['./*.html']);
});

gulp.task('default', function() {
  runSequence('jade', ['sass', 'js'], 'browserSync');
  watch(['./src/jade/**/*.jade', './articles/*.md', './config.js'], function() { runSequence('jade', browserSync.reload) });
  watch('./src/sass/**/*.scss', function() { runSequence('jade', 'sass', browserSync.reload) });
  watch('./src/js/**/*.js', function() { runSequence('js', browserSync.reload) });
});

gulp.task('prod', function() {
  runSequence('clean', 'jade', 'sass', 'sass:vendor', 'js', 'js:vendor', 'img:compress');
});

/*
-----------------------------------------------------------------------------------
|
| Functions
|
-----------------------------------------------------------------------------------
*/

function render(template, name, locals, cb) {
  return gulp.src('./src/jade/' + template + '.jade')
  .pipe(plumber(errHandler))
  .pipe(jade({ locals: locals}))
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(rename({
    basename: name,
    extname: '.html'
  }))
  .pipe(gulp.dest('.'))
  .on('end', cb)
}

function iterate(articles, index, cb) {
  if (index === articles.length) return cb();
  var article = articles[index];
  var rawMd = fs.readFileSync('./articles/' + article.slug + '.md').toString();
  article.content = md(rawMd);
  article.locals = { article: article }
  render('article', article.slug, article.locals, () => {
    iterate(articles, ++index, cb);
  });
}
