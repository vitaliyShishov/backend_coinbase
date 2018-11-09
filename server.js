import http from 'http';
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import * as dbConnection from './dbConnection';
import config from './config';
import moment from 'moment';
import routes from './src/routes';
import expressConfig from './express';
import socketIo from 'socket.io';
import {emitter} from './src/emmiter';
import { handler } from './src/handler';
import CurrencyModel from './src/models/currency';

const app = express();
const server = http.Server(app);
const htmlPath = path.resolve(__dirname, '../dist');
const io = socketIo(server, {
	path: '/socket.io'
});

expressConfig(app);

app.use('/api/v1', routes);

app.use(express.static(htmlPath));

app.get('/chart', (req, res) => {
  res.sendFile('index.html', {root: htmlPath});
});
app.use(function(req, res){
  res.status(404).send('404 - Not found');

});
server.listen(config.port);

process.setMaxListeners(0);

dbConnection
	.open()
	.then()
	.catch(err => {
		console.log('Connection to MongoDb is failed!!');
		console.log('Error: ' + err);
	});

process.on('uncaughtException', function (err) {
	if (err.name === 'MongoError') {
		mongoose.connection.emit('error', err);
	} else {
		console.log('Uncaught exception');
		console.error(err);
		process.exit(0);
	}
});

CurrencyModel
	.find({})
	.exec((err, currencies) => addInterval(currencies));

const addInterval = currencies => {
	return setInterval( () => {
		handler(currencies);
	}, 5000);
};

let btcSoc = io
	 .of('/btc')
	 .on('connection', function(socket) {
			socket.emit('connected', 'BTC connected!')
		});

let ethSoc = io
	 .of('/eth')
	 .on('connection', socket => socket.emit('connected', 'ETH connected!'));

let bthSoc = io
	 .of('/bth')
	 .on('connection', socket => socket.emit('connected', 'BTH connected'));

let ltcSoc = io
	 .of('/ltc')
	 .on('connection', socket => socket.emit('connected', 'LTC connected'));

emitter.on('btc', data => btcSoc.emit('update', JSON.parse(data)));
emitter.on('eth', data => ethSoc.emit('update', JSON.parse(data)));
emitter.on('bth', data => btcSoc.emit('update', JSON.parse(data)));
emitter.on('ltc', data => ethSoc.emit('update', JSON.parse(data)));

console.log(`UTC ${moment.utc().format('DD/MM/YYYY HH:mm:ss')}. App listening on port ${config.port}. Environment = ${config.env}.`);

module.exports = server;
