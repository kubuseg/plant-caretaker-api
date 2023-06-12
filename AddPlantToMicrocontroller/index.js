module.exports = async function (context, req) {
  context.bindings.mcOut = context.bindings.mcIn;
  const userPlants = context.bindings.users[0].plants;
  const userPlantsUUID = userPlants.map((plant) => plant.uuid);
  const index = userPlantsUUID.indexOf(req.body.plantUUID);
  if (index > -1) {
    context.bindings.mcOut[0].plantsBySensors.push(userPlants[index]);
  }
};
