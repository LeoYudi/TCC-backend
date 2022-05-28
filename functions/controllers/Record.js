const { RecordModel, SensorDataModel } = require('../database');

const insertFile = async (req, res) => {
  const { recordName, sensors } = req.body;

  if (!recordName)
    return res.status(400).json({ error: 'recordName is invalid' });

  if (!sensors)
    return res.status(400).json({ error: 'sensors is invalid' });

  if (Object.keys(sensors).length === 0)
    return res.status(400).json({ error: 'no sensor data provided' });

  try {
    const record = await RecordModel.create({ name: recordName });

    if (!record)
      return res.status(400).json({ error: 'error on creating record' });

    const data = [];
    let rowsError = 0;
    Object.keys(sensors).forEach(sensorName => {
      const rows = sensors[sensorName].split('\n');
      const att = rows.splice(0, 1)[0].split(',').filter(key => key !== '');
      rows.forEach(row => {
        const arguments = row.split(',').filter(argument => argument !== '');
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

    return res.status(200).json({ msg: 'deu certo' });

  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = {
  insertFile
}