/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import path from 'path'
import browserSync from 'browser-sync'
import del from 'del'

/*
-----------------------------------------------------------------------------------
|
| Misc. tasks
|
-----------------------------------------------------------------------------------
*/

const miscTasks = {}

// Start a development server with auto-reloading
miscTasks.server = () => {
  browserSync.init({
    server: {
      baseDir: path.join(__dirname, '..', '..')
    }
  })
}

miscTasks.clean = () => {
  return del([path.join(__dirname, '..', '..', '*.html')], { force: true })
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default miscTasks
