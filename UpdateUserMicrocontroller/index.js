module.exports = async function (context, req) {
  context.bindings.usersOut = context.bindings.usersIn;
  context.bindings.usersOut[0].mcId = req.query.mcId;
};
