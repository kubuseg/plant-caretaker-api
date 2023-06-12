module.exports = async function (context, req) {
  let plantsBySensors = context.bindings.mcIn[0].plantsBySensors;
  const sensors = plantsBySensors.map((plant) => plant.wateringLine);
  const index = sensors.indexOf(Number(req.query.sensor));
  if (index > -1) {
    plantsBySensors.splice(index, 1);
  }
  context.bindings.mcOut = context.bindings.mcIn;
  context.bindings.mcOut[0].plantsBySensors = plantsBySensors;
};
