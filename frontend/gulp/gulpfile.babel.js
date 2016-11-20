/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import gulp from 'gulp'
import watch from 'gulp-watch'
import path from 'path'
import browserSync from 'browser-sync'
import runSequence from 'run-sequence'
import markupTasks from './markup'
import scriptTasks from './scripts'
import stylesTasks from './styles'
import imageTasks from './images'
import miscTasks from './misc'

/*
-----------------------------------------------------------------------------------
|
| Gulp tasks
|
-----------------------------------------------------------------------------------
*/

// Base tasks
gulp.task('server', miscTasks.server)
gulp.task('clean', miscTasks.clean)
gulp.task('styles', stylesTasks.styles)
gulp.task('stylesVendor', stylesTasks.stylesVendor)
gulp.task('scripts', scriptTasks.scripts)
gulp.task('scriptsVendor', scriptTasks.scriptsVendor)
gulp.task('renderArticles', markupTasks.renderArticles)
gulp.task('renderIndex', markupTasks.renderIndex)
gulp.task('render404', markupTasks.render404)
gulp.task('render500', markupTasks.render500)
gulp.task('images', imageTasks.images)

// Tasks to modify the generated HTML
gulp.task('htmlSetAlt', markupTasks.htmlSetAlt)
gulp.task('htmlSetCaption', markupTasks.htmlSetCaption)
gulp.task('htmlSetSrc', markupTasks.htmlSetSrc)
gulp.task('htmlSetTableOfContents', markupTasks.htmlSetTableOfContents)
gulp.task('htmlEnrichment', (cb) => {
  runSequence('htmlSetAlt', 'htmlSetCaption', 'htmlSetSrc', 'htmlSetTableOfContents', cb)
})
gulp.task('renderPages', (cb) => {
  runSequence('renderIndex', 'render404', 'render500', cb)
})

// Development task
gulp.task('default', () => {
  runSequence('clean', 'images', 'styles', 'scripts', 'renderArticles', 'renderPages', 'htmlEnrichment', 'server')
  watch(path.join(__dirname, '..', 'src', 'styles', '**', '*.scss'), () => runSequence('styles', browserSync.reload))
  watch(path.join(__dirname, '..', 'src', 'scripts', '**', '*.js'), () => runSequence('scripts', browserSync.reload))
  watch(path.join(__dirname, '..', 'src', 'markup', '**', '*.jade'), () => runSequence('renderArticles', 'renderPages', 'htmlEnrichment', browserSync.reload))
  watch(path.join(__dirname, '..', '..', 'content', '**', '*.md'), () => runSequence('renderArticles', 'htmlEnrichment', browserSync.reload))
})

// Production task
gulp.task('prod', () => {
  runSequence('clean', 'images', 'styles', 'stylesVendor', 'scripts', 'scriptsVendor', 'renderArticles', 'renderIndex', 'htmlEnrichment')
})
