const { RecordModel, SensorDataModel } = require('../database');

const insertFileService = async (sensors, recordName) => {
  try {

    const record = await RecordModel.create({ name: recordName });

    if (!record)
      return res.status(400).json({ error: 'error on creating record' });

    const data = [];
    let rowsError = 0;
    Object.keys(sensors).forEach(sensorName => {
      const rows = sensors[sensorName].split('\n');
      const att = rows.splice(0, 1)[0].split(',');
      rows.forEach(row => {
        const arguments = row.split(',');
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
}

module.exports = { insertFileService };