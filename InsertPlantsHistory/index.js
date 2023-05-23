module.exports = async function (context, req) {
  const plantsHistoryOut = {
    dateTime: new Date().toISOString(),
    mcId: req.query.mcId,
    sensorId: req.query.sensorId,
  };
  if (req.query.watering_ml) {
    plantsHistoryOut.watering_ml = Number(req.query.watering_ml);
  }
  if (req.query.fertilizing_ml) {
    plantsHistoryOut.fertilizing_ml = Number(req.query.fertilizing_ml);
  }
  context.bindings.plantsHistoryOut = JSON.stringify(plantsHistoryOut);
};
