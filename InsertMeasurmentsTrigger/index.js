module.exports = async function (context, req) {
  const humidities = req.body.humidities;
  const measurementsOut = [];
  const date = new Date().toISOString();
  const plantsBySensors = context.bindings.mc[0].plantsBySensors;
  const wateringLines = plantsBySensors.map((plant) => plant.wateringLine);
  for (i = 0; i < humidities.length; ++i) {
    const sensorId = Object.keys(humidities[i])[0];
    const index = wateringLines.indexOf(Number(sensorId));
    if (index > -1) {
      measurementsOut.push({
        dateTime: date,
        mcId: req.body.mcId,
        plantUUID: plantsBySensors[index].uuid,
        humidity: Object.values(humidities[i])[0].humidity,
      });
    }
  }
  context.bindings.outputDocument = JSON.stringify(measurementsOut);
};
