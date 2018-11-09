import mongoose from 'mongoose';
import config from './config';

mongoose.Promise = require('bluebird');

export const open = () => {
	return new Promise((resolve, reject) => {
		mongoose.connection.once('open', () => {
			mongoose.connection.on('error', err => {
				console.error(['MongoDB connection error: ', err].join(''));
			});

			mongoose.connection.on('connected', () => {
				console.log('MongoDB connected');
			});

			mongoose.connection.on('disconnected', () => {
				console.log('MongoDB disconnected');
			});
		});

		mongoose.connect(
			config.mongoDB.uri
			, err => (err ? reject(err) : resolve()));
	});
};

export const close = () => {
	return mongoose.disconnect();
};