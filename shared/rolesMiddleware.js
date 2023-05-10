const rolesMiddleware = (...routeRoles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.sendStatus(401);
        const rolesArray = [...routeRoles];
        const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result) return res.status(401).json("Not auth for this role")
        next();
    }
}

module.exports = rolesMiddleware