import request from 'request-promise';
import config from '../../config';

export const getBuyPrice = coinbaseId => {
  const url = `${config.coinbase.apiUrl}/prices/${coinbaseId}-USD/buy`;
  return request({
    uri: url,
    method: 'GET',
    json: true
  })
};

export const getSellPrice = coinbaseId => {
  const url = `${config.coinbase.apiUrl}/prices/${coinbaseId}-USD/sell`;
  return request({
    uri: url,
    method: 'GET',
    json: true    
  });
};

export const getSpotPrice = coinbaseId => {
  const url = `${config.coinbase.apiUrl}/prices/${coinbaseId}-USD/spot`;
  return request({
    uri: url,
    method: 'GET',
    json: true    
  });
};

export const getExists = () => {
  const url = `${config.coinbase.apiUrl}/currencies`;
  return request({
    uri: url,
    method: 'GET',
    json: true
  });
};

export const getCurrencyInfo = coinbaseId => {
  return Promise
  .all([
    getBuyPrice(coinbaseId),
    getSellPrice(coinbaseId),
    getSpotPrice(coinbaseId)
  ]);
};