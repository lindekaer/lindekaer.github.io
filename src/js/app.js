import Front from './modules/front';
import Article from './modules/article';
import Map from './modules/map';
import { loadWebFonts } from './utils';

class App {
  
  constructor() {
    new Front();
    new Article();
    new Map();

    loadWebFonts();
  }

}

// Start application
new App();