module.exports = async function (context, req) {
    let plantsBySenors = context.bindings.mcIn[0].plantsBySenors;
    const sensors = plantsBySenors.map((plant) => Object.keys(plant)[0]);
    const index = sensors.indexOf(req.query.sensor);
    if (index > -1) {
        plantsBySenors.splice(index, 1);
    }
    context.bindings.mcOut = context.bindings.mcIn;
    context.bindings.mcOut[0].plantsBySenors = plantsBySenors;
}