import moment from 'moment';
import dependencyInjector from '../util/dependencyInjector';
import controllerResponse from '../util/controllerResponse';
import validationUtil from '../util/validation';
import cryptoUtil from '../util/crypto';

async function register(email, password, isAdmin = false, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(email)) {
        return controllerResponse(true, 400, 'validation/email');
    }
    if (!validationUtil.isPassword(password)) {
        return controllerResponse(true, 400, 'validation/password');
    }

    email = email.trim().toLowerCase();
    const saltRounds = 10;
    const passwordHash = await cryptoUtil.hash(password, saltRounds);

    const [user, wasCreated] = await dependencies.db.models.user.findOrCreate({
        where: {
            email: email,
        },
        defaults: {
            email: email,
            password: passwordHash,
        },
    });

    if (!wasCreated) {
        return controllerResponse(true, 422, 'auth/existence');
    }

    if (isAdmin) {
        await dependencies.db.models.admin.create({
            userEmail: user.email,
        });
    } else {
        await dependencies.db.models.customer.create({
            userEmail: user.email,
        });
    }

    const authToken = await dependencies.db.models.authToken.create({
        userEmail: user.email,
    });

    return controllerResponse(false, 200, {
        authToken: authToken.id,
    });
}

async function login(email, password, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(email)) {
        return controllerResponse(true, 400, 'validation/email');
    }
    if (!validationUtil.isPassword(password)) {
        return controllerResponse(true, 400, 'validation/password');
    }

    email = email.trim().toLowerCase();

    const user = await dependencies.db.models.user.findOne({
        where: {
            email: email,
        }
    });

    if (!user) {
        return controllerResponse(true, 404, 'auth/generic');
    }

    const rotateEveryHowManyMonths = 6;
    if (moment().diff(moment(user.passwordDate), 'months', true) > rotateEveryHowManyMonths) {
        return controllerResponse(true, 500, 'expiry/password');
    }

    const passwordsMatch = await cryptoUtil.compare(password, user.password);
    if (!passwordsMatch) {
        return controllerResponse(true, 404, 'auth/generic');
    }

    const authToken = await dependencies.db.models.authToken.create({
        userEmail: user.email,
    });

    return controllerResponse(false, 200, {
        authToken: authToken.id,
    });
}

async function logout(authToken, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isId(authToken)) {
        return controllerResponse(true, 400, 'validation/authToken');
    }

    const [updatedRowsCount] = await dependencies.db.models.authToken.update({
        active: false,
    }, {
        where: {
            [dependencies.db.Sequelize.Op.or]: {
                id: authToken,
                createdAt: {
                    [dependencies.db.Sequelize.Op.lte]: moment().subtract(1, 'days').toDate(),
                },
            }
        },
    });

    if (updatedRowsCount < 1) {
        return controllerResponse(true, 404, 'auth/token');
    }

    return controllerResponse(false);
}

async function changePassword(email, oldPassword, newPassword, dependencies = null) {
    dependencies = dependencyInjector(['db'], dependencies);

    if (!validationUtil.isEmail(email)) {
        return controllerResponse(true, 400, 'validation/email');
    }
    if (!validationUtil.isPassword(oldPassword)) {
        return controllerResponse(true, 400, 'validation/oldPassword');
    }
    if (!validationUtil.isPassword(newPassword)) {
        return controllerResponse(true, 400, 'validation/newPassword');
    }
    if (newPassword === oldPassword) {
        return controllerResponse(true, 400, 'validation/passwordsEqual');
    }

    email = email.trim().toLowerCase();

    const user = await dependencies.db.models.user.findOne({
        where: {
            email: email,
        }
    });

    if (!user) {
        return controllerResponse(true, 404, 'auth/generic');
    }

    const passwordsMatch = await cryptoUtil.compare(oldPassword, user.password);
    if (!passwordsMatch) {
        return controllerResponse(true, 404, 'auth/generic');
    }

    await dependencies.db.models.user.update({
        password: await cryptoUtil.hash(newPassword, 10),
        passwordDate: Date.now(),
    }, {
        where: {
            email: email,
        },
    });

    return controllerResponse(false, 200, null);
}

function whoAmI(requestingUser) {
    if (!validationUtil.exists(requestingUser)) {
        return controllerResponse(true, 403, '');
    }

    const isAdmin = !!requestingUser.admin;
    const isCustomer = !!requestingUser.customer;
    const isStudent = isCustomer && !!requestingUser.customer.isStudent;
    return controllerResponse(false, 200, {
        isAdmin,
        isCustomer,
        isStudent,
    });
}

export default {
    register,
    login,
    logout,
    changePassword,
    whoAmI,
};
