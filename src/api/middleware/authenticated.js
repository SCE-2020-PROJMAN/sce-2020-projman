import db from '../db';
import asyncWrapper from '../util/asyncWrapper';
import validationUtil from '../util/validation';

export default (dbModels = db.models) => asyncWrapper(async (req, res, next) => {
    const authTokenId = req.headers.authorization;
    if (!authTokenId) {
        res.status(403).send('Authorization header required');
        return;
    }

    if (!validationUtil.isId(authTokenId)) {
        res.status(403).send('Authorization header invalid');
        return;
    }

    const authToken = await dbModels.authToken.findOne({
        where: {
            id: authTokenId,
            active: true,
        },
        include: [{model: dbModels.user}],
    });

    if (!authToken) {
        res.status(403).send('not found');
        return;
    }

    req.requestingAuthToken = authToken;
    req.requestingUser = authToken.user;

    next();
});
