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

var fs           = require('fs');
var del          = require('del');
var gulp         = require('gulp');
var md           = require('marked');
var runSequence  = require('run-sequence');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer')
var browserify   = require('browserify');
var rollupify    = require('rollupify');
var watchify     = require('watchify');
var babelify     = require('babelify');
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso         = require('gulp-csso');
var htmlmin      = require('gulp-htmlmin');
var plumber      = require('gulp-plumber');
var rename       = require('gulp-rename');
var jade         = require('gulp-jade');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var watch        = require('gulp-watch');
var browserSync  = require('browser-sync').create();

var errHandler = {
  errorHandler: function(err) {
    console.log(err);
    this.emit('end');
  }
}

/*
-----------------------------------------------------------------------------------
|
| Tasks
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

gulp.task('sass', function() {
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

gulp.task('sass:vendor', function() {
  return gulp.src([
    './node_modules/prismjs/themes/prism-okaidia.css',
    './node_modules/leaflet/dist/leaflet.css',
    './node_modules/hint.css/hint.css'
  ])
  .pipe(plumber(errHandler))
  .pipe(concat('dist-vendor.min.css'))
  .pipe(csso())
  .pipe(gulp.dest('./assets/css'))
  .pipe(browserSync.stream());
});

gulp.task('js', function() {
  var bundler = browserify('./src/js/app.js', { debug: true })
  .transform(rollupify)
  .transform(babelify, { presets: ['es2015'] });

  return bundler.bundle()
  .on('error', function(err) { console.error(err); this.emit('end'); })
  .pipe(source('dist.min.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('./assets/js'))
  .pipe(browserSync.stream());
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

gulp.task('jade', function() {
  runSequence('jade:articles', 'jade:pages', browserSync.reload);
});

gulp.task('jade:articles', function(cb) {
  runSequence['clean'];
  var config = require('./config.js');
  var articles = config.articles;
  iterate(articles, 0, cb);
});

gulp.task('jade:pages', function(cb) {
  var locals = { articles: require('./config.js').articles }
  render('index', 'index', locals, cb);
});

gulp.task('clean', function() {
  return del(['./*.html']);
});

gulp.task('default', function() {
  runSequence(['sass', 'js'], 'jade', 'browserSync');
  watch(['./src/jade/**/*.jade', './articles/*.md', './config.js'], function() { gulp.start('jade'); });
  watch('./src/sass/**/*.scss', function() { gulp.start('sass'); });
  watch('./src/js/**/*.js', function() { gulp.start('js'); });
});

gulp.task('prod', function() {
  runSequence('clean', 'sass', 'sass:vendor', 'js', 'js:vendor', 'jade');
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
