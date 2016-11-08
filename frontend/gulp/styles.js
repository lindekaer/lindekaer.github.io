/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import path from 'path'
import gulp from 'gulp'
import plumber from 'gulp-plumber'
import sass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import csso from 'gulp-csso'
import rename from 'gulp-rename'
import concat from 'gulp-concat'
import { errHandler } from '../utils'

/*
-----------------------------------------------------------------------------------
|
| Style tasks
|
-----------------------------------------------------------------------------------
*/

const styleTasks = {}

styleTasks.styles = () => {
  return gulp.src(path.join(__dirname, '..', 'src', 'styles', '*.scss'))
    .pipe(plumber(errHandler))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(rename({
      basename: 'dist',
      suffix: '.min',
      extname: '.css'
    }))
    .pipe(gulp.dest(path.join(__dirname, '..', 'dist', 'styles')))
}

styleTasks.stylesVendor = () => {
  return gulp.src([
    path.join(__dirname, '..', '..', 'node_modules', 'prismjs', 'themes', 'prism-okaidia.css'),
    path.join(__dirname, '..', '..', 'node_modules', 'leaflet', 'dist', 'leaflet.css'),
    path.join(__dirname, '..', '..', 'node_modules', 'hint.css', 'hint.css'),
    path.join(__dirname, '..', '..', 'node_modules', 'jsonlylightbox', 'css', 'lightbox.css')
  ])
  .pipe(plumber(errHandler))
  .pipe(concat('dist-vendor.min.css'))
  .pipe(csso())
  .pipe(gulp.dest(path.join(__dirname, '..', 'dist', 'styles')))
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default styleTasks
