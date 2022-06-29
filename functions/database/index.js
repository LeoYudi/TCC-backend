const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connect = async (url) => {
  try {
    await mongoose.connect(url);

    mongoose.connection.on('error', error => console.log(error));
    mongoose.connection.on('open', () => console.log('Conexão com o banco criada'));

  } catch (error) {
    return;
  }
}

const RecordSchema = new Schema({
  description: String,
  created_at: { type: Date, default: Date.now() }
});

const SensorDataSchema = new Schema({
  x: Number,
  y: Number,
  z: Number,
  timestamp: Number,
  sensor: {
    type: String,
    enum: ['acelerometro', 'giroscopio', 'magnetometro']
  },
  id_record: {
    type: Schema.ObjectId,
    ref: 'records'
  }
});

const GpsDataSchema = new Schema({
  lat: Number,
  lon: Number,
  alt: Number,
  timestamp: Number,
  id_record: {
    type: Schema.ObjectId,
    ref: 'records'
  }
});

const RecordModel = mongoose.model('records', RecordSchema);
const SensorDataModel = mongoose.model('sensor_datas', SensorDataSchema);
const GpsDataModel = mongoose.model('gps_datas', GpsDataSchema);

module.exports = {
  connect,
  RecordModel,
  SensorDataModel,
  GpsDataModel
};