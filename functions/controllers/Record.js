const { insertFileService, listRecordService, removeService, getByIdService } = require("../services/record");

const insertFile = async (req, res) => {
  const { description, sensors, location } = req.body;

  if (!description)
    return res.status(400).json({ error: 'Campo "description" é inválido' });

  if (!sensors)
    return res.status(400).json({ error: 'Campo "sensors" é inválido' });

  if (!location)
    return res.status(400).json({ error: 'Campo "location" é inválido' });

  if (Object.keys(sensors).length === 0)
    return res.status(400).json({ error: 'Nenhum dado de sensor fornecido' });

  try {
    const response = await insertFileService(sensors, description, location);

    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

const list = async (req, res) => {
  try {
    const response = await listRecordService();

    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await getByIdService(id);

    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
}

const remove = async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: 'Campo "id" é inválido' });

  try {
    const response = await removeService(id);
    if (response.error)
      return res.status(400).json(response);

    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

module.exports = {
  insertFile,
  list,
  getById,
  remove
}