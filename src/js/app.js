import Front from './modules/front';
import Article from './modules/article';
import Map from './modules/map';

class App {
  constructor() {
    new Front();
    new Article();
    new Map();
  }
}

// Start application
new App();
