const { RecordModel, SensorDataModel, GpsDataModel } = require('../database');

const { ObjectId } = require('mongoose').Types;

const insertFileService = async (sensors, description, location) => {
  try {

    const record = await RecordModel.create({ description });

    if (!record)
      return res.status(400).json({ error: 'Erro ao salvar' });

    // insert sensor data
    const sensorData = [];
    let rowsError = 0;
    Object.keys(sensors).forEach(sensorName => {
      const rows = sensors[sensorName].split('\n').filter(row => !(!row));
      const att = rows.splice(0, 1)[0].split(';');
      rows.forEach(row => {
        const arguments = row.split(';');
        if (arguments.length !== 4) {
          rowsError++;
          return;
        }

        const newObject = {
          sensor: sensorName,
          id_record: record.id
        };
        att.forEach((key, index) => {
          newObject[key] = arguments[index]
        });

        sensorData.push(newObject);
      })
    });

    // insert gps data
    const gpsData = [];
    const gpsDataRows = location.split('\n').filter(row => !(!row));
    gpsDataRows.splice(0, 1);
    gpsDataRows.forEach(row => {
      const arguments = row.split(';');
      if (arguments.length !== 4) {
        rowsError++;
        return;
      }

      gpsData.push({
        lat: arguments[0],
        lon: arguments[1],
        alt: arguments[2],
        timestamp: arguments[3],
        id_record: record.id
      });
    });

    if (rowsError !== 0)
      console.log(`- Erro: ${rowsError} linhas inválidas`);

    await SensorDataModel.insertMany(sensorData);
    await GpsDataModel.insertMany(gpsData);

    return { msg: `Arquivo salvo com ${rowsError} linhas inválidas` };

  } catch (error) {
    throw { error };
  }
};

const listRecordService = async () => {
  try {
    return await RecordModel.find();
  } catch (error) {
    throw { error };
  }
};

const getByIdService = async id => {
  try {
    const rawData = await RecordModel.aggregate([{
      $match: { _id: ObjectId(id) },
    }, {
      $lookup: {
        from: 'sensor_datas',
        localField: '_id',
        foreignField: 'id_record',
        as: 'sensors'
      }
    }, {
      $lookup: {
        from: 'gps_datas',
        localField: '_id',
        foreignField: 'id_record',
        as: 'locations'
      }
    }]);

    if (rawData.length === 0)
      throw { error: 'record not found' };

    const result = {
      description: rawData[0].description,
      created_at: rawData[0].created_at,
      sensors: {},
      locations: rawData[0].locations,
    };

    rawData[0].sensors.forEach(sensorData => {
      if (!result.sensors[sensorData.sensor])
        result.sensors[sensorData.sensor] = [];

      result.sensors[sensorData.sensor].push(sensorData);
    });

    return result;

  } catch (error) {
    throw { error };
  }
};

const removeService = async (id) => {
  try {
    const record = await RecordModel.findById(id);

    if (!record)
      return { error: 'Não encontrado' };

    const { deletedCount } = await SensorDataModel.deleteMany({ id_record: record._id })
    await RecordModel.deleteOne({ _id: record._id });

    return { msg: `Gravação deletada assim como seus ${deletedCount} registros de sensor` };

  } catch (error) {
    throw { error };
  }
};

module.exports = { insertFileService, listRecordService, getByIdService, removeService };