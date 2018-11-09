import mongoose from 'mongoose';
import * as Currency from '../data/currency';
import config from '../../config';
import * as coinbase from '../data/coinbase';
import { emitter } from '../emmiter';

export const add = (req, res) => {
  if (!req.body || !req.body.data) {
    return res.status(400).json({
      message: 'No data provided!'
    });
  }

  let buyPrice,
    sellPrice,
    spotPrice;

  const data = req.body.data;

  const handleCoinbaseResponse = result => {
    buyPrice = result['0'].data;
    sellPrice = result['1'].data;
    spotPrice = result['2'].data;

    data.dayHigh = spotPrice.amount;
    data.dayLow = spotPrice.amount;

    return data;
  };

  const addToDb = data => Currency.add(data);

  const handleDbResponse = savedCurrency => {
    let currency = result.toObject();
    currency.buyPrice = buyPrice.amount;
    currency.sellPrice = sellPrice.amount;
    return currency;
  };

  return coinbase
    .getCurrencyInfo(data.coinbaseId)
    .then(handleCoinbaseResponse)
    .then(handleDbResponse)
    .then(currency => res.status(200).json(currency))
    .catch(err => res.status(400).json(err.message || {}));
};

export const getList = (req, res) => {
  const handleDbResponse = currencyList => {
    let finalResult = [];

    const mapper = charts => {
      return charts.map(i => ({
        spotPrice: i.spotPrice,
        buyPrice: i.buyPrice,
        sellPrice: i.sellPrice,
        time: new Date(i.datetime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        })
      }));
    };

    const formatCurrency = currency => {
      currency.chart = mapper(currency.chart);
      return currency;
    };

    return currencyList.map(formatCurrency);
  };

  return Currency
    .getList()
    .then(handleDbResponse)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json(err.message || {}));
};

export const getOne = (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({
      message: 'No data provided!'
    });
  }

  return Currency
    .get(req.params.id)
    .then(result => {
      let response = result['0'].toObject();
      let chartArray = result['1'].map(i => {
        return {
          spotPrice: i.spotPrice,
          buyPrice: i.buyPrice,
          sellPrice: i.sellPrice,
          time: new Date(i.datetime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        };
      });
      response.chart = chartArray;
      res.status(200).json(response)
    })
    .catch(err => res.status(400).json(err.message || {}));
}
