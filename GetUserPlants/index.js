module.exports = async function (context) {
    context.res = {
        body: context.bindings.user[0].plants
    };
}