import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CurrencyActionSchema = new Schema({
  currencyId: {
    require: true, 
    type: Schema.Types.ObjectId,
    ref: 'Currency'
  },
  buyPrice: {type: Number, default: 0},
  sellPrice: {type: Number, default: 0},
  spotPrice: {type: Number, default: 0},
  datetime: {type: Date, default: Date.now}
});

export default mongoose.model('CurrencyAction', CurrencyActionSchema);