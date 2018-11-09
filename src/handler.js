import * as coinbase from './data/coinbase';
import CurrencyModel from './models/currency';
import CurrencyActionModel from './models/currencyAction';
import {
  emitter
} from './emmiter';

export const handler = currencies => {
  /** Emmit event for triggering sockets*/
  const emitEvent = (currency, action) => {
    const currencyObject = currency.toObject();
    currencyObject.chart = [{
      spotPrice: action.spotPrice,
      buyPrice: action.buyPrice,
      sellPrice: action.sellPrice,
      time: new Date(action.datetime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    }]
    console.log('emit');
    emitter.emit(currency.coinbaseId.toLowerCase(), JSON.stringify(currencyObject));
  };

  /**Change DB object with new data */
  const formatHighPrice = (spotPrice, arrIndex) => {
    let changeHigh = (spotPrice - currencies[arrIndex].dayLow).toFixed(2);
    let changePercentHigh = (changeHigh / currencies[arrIndex].dayLow * 100).toFixed(2);

    currencies[arrIndex].set('dayHigh', spotPrice);
    currencies[arrIndex].set('dayChange', changeHigh);
    currencies[arrIndex].set('dayChangePercent', changePercentHigh);
  };

  /**Change DB object with new data */
  const formatLowPrice = (spotPrice, arrIndex) => {
    let changeLow = (currencies[arrIndex].dayHigh - spotPrice).toFixed(2);
    let changePercentLow = (changeLow / currencies[arrIndex].dayHigh * 100).toFixed(2);

    currencies[arrIndex].set('dayLow', spotPrice);
    currencies[arrIndex].set('dayChange', changeLow);
    currencies[arrIndex].set('dayChangePercent', `${changePercentLow}`);
  }

  /**Compare existsing currencies data with new data */
  const processCurrency = (arrIndex, prices) => {
    let newSpotPrice = parseInt(prices.spot).toFixed(2);
    let currentHighPrice = currencies[arrIndex].dayHigh;
    let currentLowPrice = currencies[arrIndex].dayLow;

    let isChanged = false;

    if (newSpotPrice > currentHighPrice) {
      isChanged = true;
      formatHighPrice(newSpotPrice, arrIndex);
    } else if (newSpotPrice < currentLowPrice) {
      isChanged = true;
      formatLowPrice(newSpotPrice, arrIndex);
    }

    if (isChanged) {
      let currencyAction = new CurrencyActionModel({
        currencyId: currencies[arrIndex]._id,
        buyPrice: prices.buy,
        sellPrice: prices.sell,
        spotPrice: prices.spot,
      });

      currencies[arrIndex].set('changeInterval', 0);
      currencies[arrIndex].save();

      currencyAction.save();

      emitEvent(currencies[arrIndex], currencyAction);
    } else {
      let changeInterval = currencies[arrIndex].changeInterval;

      if (changeInterval >= 60) {
        let currencyAction = new CurrencyActionModel({
          currencyId: currencies[arrIndex]._id,
          buyPrice: prices.buy,
          sellPrice: prices.sell,
          spotPrice: prices.spot,
        });

        currencyAction.save();

        currencies[arrIndex].set('changeInterval', 0);
        currencies[arrIndex].save();

        emitEvent(currencies[arrIndex], currencyAction);
      } else {
        changeInterval++;
        currencies[arrIndex].set('changeInterval', changeInterval);
        currencies[arrIndex].save();
      }
    }
  };

  /**Handle responses and process currencies */
  const handlePromises = result => {
    const getPricesArray = index => {
      return {
        spot: result[index].data.amount,
        sell: result[index + 1].data.amount,
        buy: result[index + 2].data.amount
      };
    };

    processCurrency(0, getPricesArray(0));
    processCurrency(1, getPricesArray(3));
    processCurrency(2, getPricesArray(6));
    processCurrency(3, getPricesArray(9));
  };

  let promises = [];

  currencies.map(c => {
    promises.push(coinbase.getSpotPrice(c.coinbaseId));
    promises.push(coinbase.getSellPrice(c.coinbaseId));
    promises.push(coinbase.getBuyPrice(c.coinbaseId));
  });

  Promise
    .all(promises)
    .then(handlePromises)
    .catch(err => console.log(err));
};
