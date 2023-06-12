module.exports = async function (context, req) {
  const plantsHistoryOut = {
    dateTime: new Date().toISOString(),
    mcId: req.query.mcId,
  };
  if (req.query.watering_ml) {
    plantsHistoryOut.watering_ml = Number(req.query.watering_ml);
  }
  if (req.query.fertilizing_ml) {
    plantsHistoryOut.fertilizing_ml = Number(req.query.fertilizing_ml);
  }

  const plantsBySensors = context.bindings.mc[0].plantsBySensors;
  const wateringLines = plantsBySensors.map((plant) => plant.wateringLine);
  const index = wateringLines.indexOf(Number(req.query.sensorId));
  if (index > -1) {
    plantsHistoryOut.plantUUID = plantsBySensors[index].uuid;
    context.bindings.plantsHistoryOut = JSON.stringify(plantsHistoryOut);
  }
};
