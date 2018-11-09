import mongoose from 'mongoose';
import CurrencyModel from '../models/currency';
import CurrencyAction from '../models/currencyAction';

export const add = data => {
  const currency = new CurrencyModel(data);

  return currency.save();  
}

export const get = currencyId => {
  return Promise.all([
    CurrencyModel.findById(currencyId).lean().exec(),
    CurrencyAction.find({ currencyId: currencyId }).lean().exec()
  ]);
};

export const getList = () => {
  return CurrencyModel.aggregate([
    {
      $lookup: {
        from: 'currencyactions',
        localField: '_id',
        foreignField: 'currencyId',
        as: 'chart'
      }
    }
  ]).exec();
};