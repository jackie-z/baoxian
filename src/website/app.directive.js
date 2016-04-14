import template from './app.html';

class AppDirective {
  constructor() {
    this.template = template;
    this.restrict = 'E';
  }
}

export default AppDirective;
