const port = process.env.PORT || 9000;
const domain = process.env.DOMAIN || process.env.IP || '0.0.0.0';
const protocol = 'http://';
const nodeEnv = 'local';

export default {
  port: port,
  protocol: protocol,
	env: nodeEnv,
  mongoDB: {
		uri: 'mongodb://localhost:27017/vui'
  },
  domain: domain,
  coinbase: {
    apiUrl: "https://api.coinbase.com/v2"
  }
};
