import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

export default app => {
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(cors());
};

