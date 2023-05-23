module.exports = async function (context, req) {
    let plants = context.bindings.usersIn[0].plants;
    const plantsUUID = plants.map((plant) => plant.uuid);
    const index = plantsUUID.indexOf(req.query.uuid);
    if (index > -1) {
        plants.splice(index, 1);
    }
    context.bindings.usersOut = context.bindings.usersIn;
    context.bindings.usersOut[0].plants = plants;
}