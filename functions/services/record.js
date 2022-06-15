const { RecordModel, SensorDataModel } = require('../database');

const { ObjectId } = require('mongoose').Types;

const insertFileService = async (sensors, description) => {
  try {

    const record = await RecordModel.create({ description });

    if (!record)
      return res.status(400).json({ error: 'Erro ao salvar' });

    const data = [];
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

        data.push(newObject);
      })
    });

    if (rowsError !== 0)
      console.log(`- Erro: ${rowsError} linhas inválidas`);

    await SensorDataModel.insertMany(data);
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

module.exports = { insertFileService, listRecordService, removeService };