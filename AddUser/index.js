module.exports = async function (context, req) {
    if (!context.bindings.checkUsername[0]) {
        const maxId = Number(context.bindings.usersIn[0].id);
        context.bindings.usersOut = {
            id: String(maxId+1),
            username: req.query.username,
            password: req.query.password
        };
    } else {
        context.res = {
            status: 500,
            body: "Username alredy in database!"
        }
    }
}