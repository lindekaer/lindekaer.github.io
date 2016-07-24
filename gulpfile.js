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
  .on('error', function(err) { console.log(err); this.emit('end'); })
  .pipe(source('dist.min.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('./assets/js'));
});

gulp.task('js:vendor', function() {
  return gulp.src([
    './node_modules/prismjs/prism.js',
    './node_modules/prismjs/components/prism-bash.js',
    './node_modules/leaflet/dist/leaflet.js',
    './node_modules/jump.js/dist/jump.min.js'
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
  runSequence(['jade:articles', 'jade:pages'], 'html:enrich-title', 'html:enrich-caption', 'html:enrich-src', 'html:enrich-table-of-contents', cb);
});

gulp.task('jade:articles', function(cb) {
  runSequence['clean'];
  var config = require('./config.js');
  var articles = config.articles;
  iterate(articles, 0, cb);
});

gulp.task('jade:pages', function(cb) {
  var articles = require('./config.js').articles;
  var slides   = require('./config.js').slides;
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
   content: content,
   slides: slides
  }

  render('index', 'index', locals, cb);
});

gulp.task('html:enrich-title', function() {
  return gulp.src('*.html')
  .pipe(cheerio(function ($, file) {
    $('img').each(function(index, el) {
      var title = $(el).attr('title');
      $(el).attr('alt', title);
    });
  }))
  .pipe(gulp.dest('.'));
});

gulp.task('html:enrich-caption', function() {
  return gulp.src('*.html')
  .pipe(cheerio(function ($, file) {
    $('.media').each(function(index, el) {
      var numberOfChildren = $(el).children().length;
      if (numberOfChildren > 1) return;
      var text = $(el).find('img').attr('title');
      $(el).append('<p class="media__caption">' + text + '</p>');
    });
  }))
  .pipe(gulp.dest('.'));
});

gulp.task('html:enrich-src', function() {
  return gulp.src('*.html')
  .pipe(cheerio(function ($, file) {
    $('.media__image').each(function(index, el) {
      var fileName = $(el).attr('data-src');
      fileName = slugify($('h1').first().text()) + '.' + fileName;
      $(el).attr('data-src', fileName);
    });
  }))
  .pipe(gulp.dest('.'));
});

gulp.task('html:enrich-table-of-contents', function() {
  return gulp.src('*.html')
  .pipe(cheerio(function ($, file) {

    if (!$('.table-of-contents').length) return;

    $('h2, h3, h4, h5, h6').each(function(index, el) {
      
      // Add unique class to all headings (anchor for scrolling)
      var text = $(el).text()
      $(el).addClass('jump-' + slugify(text));

      // Add table-of-contents elements to the DOM
      var headingNumber = $(el)[0].tagName.split('h')[1];
      var $tableEl = $('<li><a></a></li>');
      $tableEl.find('a').text(text);
      $tableEl.find('a').attr('href', '#');
      $tableEl.find('a').attr('data-jump', slugify(text));
      $tableEl.find('a').addClass(`number-${headingNumber}`);
      $('.table-of-contents').append($tableEl);
    });

    
    
    
  }))
  .pipe(gulp.dest('.'));
});

/*
-----------------------------------------------------------------------------------
|
| Images
|
-----------------------------------------------------------------------------------
*/

gulp.task('img:compress', () => {
  runSequence(['img:compress:general', 'img:compress:desktop', 'img:compress:mobile'])
});

gulp.task('img:compress:general', () => {
    return gulp.src('./img/*')
    .pipe(imageminOptipng({optimizationLevel: 3})())
    .pipe(imageminJpegtran({progressive: true})())
    .pipe(gulp.dest('./img'));
});

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

function slugify(str) {
  var latinMap = {"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","ẞ":"SS","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ß":"ss","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};
  return str.toString().toLowerCase()
    .replace(/\s+/g, '-')                                   // Replace spaces with -
    .replace(/[^A-Za-z0-9\[\] ]/g, (x) => latinMap[x] || x) // Normalize accented characters
    .replace(/[^\w\-]+/g, '')                               // Remove all non-word characters
    .replace(/\-\-+/g, '-')                                 // Replace multiple - with single -
    .replace(/^-+/, '')                                     // Trim - from start of text
    .replace(/-+$/, '');                                    // Trim - from end of text
}
