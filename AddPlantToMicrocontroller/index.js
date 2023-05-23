
module.exports = async function (context, req) {
    context.bindings.mcOut = context.bindings.mcIn;
    const userPlants = context.bindings.users[0].plants;
    const userPlantsUUID = userPlants.map((plant) => plant.uuid);
    const index = userPlantsUUID.indexOf(req.query.plantUUID);
    if (index > -1) {
        context.bindings.mcOut[0].plantsBySenors.push({[req.query.sensorId]: userPlants[index]});
    }    
}
    