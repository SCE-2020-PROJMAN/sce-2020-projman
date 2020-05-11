import db from '../db';
import asyncWrapper from '../util/asyncWrapper';
import validationUtil from '../util/validation';

export default (dbModels = db.models) => asyncWrapper(async (req, res, next) => {
    const authTokenId = req.headers.authorization;
    if (!authTokenId) {
        res.status(403).send('auth/required');
        return;
    }

    if (!validationUtil.isId(authTokenId)) {
        res.status(403).send('auth/validation');
        return;
    }

    const authToken = await dbModels.authToken.findOne({
        where: {
            id: authTokenId,
            active: true,
        },
        include: [{
            model: dbModels.user,
            include: [{
                model: db.models.admin,
                required: false,
            }, {
                model: db.models.customer,
                required: false,
            }],
        }],
    });

    if (!authToken) {
        res.status(403).send('auth/existence');
        return;
    }

    req.requestingAuthToken = authToken;
    req.requestingUser = authToken.user;

    next();
});
