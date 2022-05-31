const { insertFileService } = require("../services/record");

const insertFile = async (req, res) => {
  const { recordName, sensors } = req.body;

  if (!recordName)
    return res.status(400).json({ error: 'recordName is invalid' });

  if (!sensors)
    return res.status(400).json({ error: 'sensors is invalid' });

  if (Object.keys(sensors).length === 0)
    return res.status(400).json({ error: 'no sensor data provided' });

  try {
    const response = await insertFileService(sensors, recordName)

    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = {
  insertFile
}