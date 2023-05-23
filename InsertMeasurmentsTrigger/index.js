module.exports = async function (context, req) {
  const humidities = req.body.humidities;
  const measurementsOut = [];
  const date = new Date().toISOString();
  for (i = 0; i < humidities.length; ++i) {
    measurementsOut.push({
      dateTime: date,
      mcId: req.body.mcId,
      sensorId: Object.keys(humidities[i])[0],
      humidity: Object.values(humidities[i])[0].humidity,
    });
  }
  context.bindings.outputDocument = JSON.stringify(measurementsOut);
};
