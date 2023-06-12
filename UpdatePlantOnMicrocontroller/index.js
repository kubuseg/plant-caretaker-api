module.exports = async function (context, req) {
  context.bindings.mcOut = context.bindings.mcIn;
  const userPlants = context.bindings.users[0].plants;
  const userPlantsUUID = userPlants.map((plant) => plant.uuid);
  const userPlantIndex = userPlantsUUID.indexOf(req.body.plantUUID);

  const plantsBySensors = context.bindings.mcOut[0].plantsBySensors;
  const mcPlantsUUID = plantsBySensors.map((plant) => plant.uuid);
  const mcPlantIndex = mcPlantsUUID.indexOf(req.body.plantUUID);
  if (userPlantIndex > -1 && mcPlantIndex > -1) {
    context.bindings.mcOut[0].plantsBySensors[mcPlantIndex] =
      userPlants[userPlantIndex];
  }
};
