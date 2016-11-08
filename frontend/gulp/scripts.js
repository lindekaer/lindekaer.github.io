/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import gulp from 'gulp'
import plumber from 'gulp-plumber'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import path from 'path'
import browserify from 'browserify'
import rollupify from 'rollupify'
import babelify from 'babelify'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'
import { errHandler } from '../utils'

/*
-----------------------------------------------------------------------------------
|
| Script tasks
|
-----------------------------------------------------------------------------------
*/

const scriptTasks = {}

scriptTasks.scripts = () => {
  const bundler = browserify(path.join(__dirname, '..', 'src', 'scripts', 'app.js'), { debug: true })
    .transform(rollupify)
    .transform(babelify, { presets: ['es2015', 'stage-0'] })

  return bundler.bundle()
    .on('error', function (err) { console.log(err); this.emit('end') })
    .pipe(source('dist.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(path.join(__dirname, '..', 'dist', 'scripts')))
}

scriptTasks.scriptsVendor = () => {
  return gulp.src([
    path.join(__dirname, '..', '..', 'node_modules', 'prismjs', 'prism.js'),
    path.join(__dirname, '..', '..', 'node_modules', 'prismjs', 'components', 'prism-bash.js'),
    path.join(__dirname, '..', '..', 'node_modules', 'leaflet', 'dist', 'leaflet.js'),
    path.join(__dirname, '..', '..', 'node_modules', 'jump.js', 'dist', 'jump.min.js'),
    path.join(__dirname, '..', '..', 'node_modules', 'jsonlylightbox', 'js', 'lightbox.js')
  ])
  .pipe(plumber(errHandler))
  .pipe(concat('dist-vendor.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest(path.join(__dirname, '..', 'dist', 'scripts')))
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default scriptTasks
