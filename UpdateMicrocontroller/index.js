module.exports = async function (context, req) {
  context.bindings.mcOut = context.bindings.mcIn;
  context.bindings.mcOut[0] = req.body.mc;
};
