'use strict';

let express = require('express');
let app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static('public'));

app.listen(app.get('port'), () => console.log('Server started: http://localhost:' + app.get('port') + '/'));

process.on('uncaughtException', err => console.log(err));
