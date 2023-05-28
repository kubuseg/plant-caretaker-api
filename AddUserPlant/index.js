const crypto = require("crypto");

module.exports = async function (context, req) {
  context.bindings.usersOut = context.bindings.usersIn;
  const plant = req.body.plant;
  plant.uuid = crypto.randomUUID();
  plant.flowerpotSize = "SMALL";
  context.bindings.usersOut[0].plants.push(plant);
  context.res = {
    body: { plant },
  };
};
