import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CurrencySchema = new Schema({
  title: {
    require: true, 
    unique: true, 
    type: String
  },
  coinbaseId: {
    require: true, 
    unique: true, 
    type: String
  },
  changeInterval: {type: Number, default: 0},  
  dayHigh: {type: Number, default: 0},
  dayLow: {type: Number, default: 0},
  dayChange: {type: Number, default: 0},
  dayChangePercent: {type: Number, default: 0}
});

export default mongoose.model('Currency', CurrencySchema);