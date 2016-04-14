import app from './app';
import colors from 'colors';
import config from 'config';

console.info(colors.blue(`==> Listening on port ${config.ports.httpServer}. Open up http://localhost:${config.ports.httpServer}/ in your browser.`));

app.listen(config.ports.httpServer);
