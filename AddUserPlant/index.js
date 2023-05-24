const crypto = require("crypto");

module.exports = async function (context) {
  context.bindings.usersOut = context.bindings.usersIn;
  const plant = context.bindings.plant[0];
  plant.uuid = crypto.randomUUID();
  plant.flowerpotSize = "SMALL";
  context.bindings.usersOut[0].plants.push(plant);
  context.res = {
    body: { uuid: plant.uuid },
  };
};
