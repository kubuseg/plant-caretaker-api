module.exports = async function (context, req) {
  context.bindings.usersOut = context.bindings.usersIn[0];
  const plants = context.bindings.usersIn[0].plants;
  const plantsUUID = plants.map((plant) => plant.uuid);
  const index = plantsUUID.indexOf(req.query.uuid);
  if (index > -1) {
    plants[index] = req.body.plant;
  }
  context.bindings.usersOut.plants = plants;
};
