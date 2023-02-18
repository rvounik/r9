require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nocache = require('nocache');
const helpers = require('./helpers');

const app = express();

// hash passwords
const argon2 = require('argon2');

// parse cookie content
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// used to look up credentials on login
const { models } = require('../sequelize');

// sign and verify tokens
const jwt = require('jsonwebtoken');

// define app secrets
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
let refreshTokens = [];

// parse requests and responses as urlencoded and json
// since 4.16: https://stackoverflow.com/questions/47232187/express-json-vs-bodyparser-json/47232318#47232318
app.use(express.urlencoded({ extended: true })); // todo: check if you really need urlencoded support, isnt json enough?
app.use(express.json());

// apply cors middleware and set it to include credentials on cross-origin requests
app.use(cors({ credentials: true, origin: true }));

// disable cache
app.use(nocache());

// define lifetime of tokens
// todo: this is also configured in App.config, why in 2 places?
const access_token_time_to_live = '15m';
const refresh_token_time_to_live = '1d';

// define admin routes
const admin_routes = {
    genres: require('./routes/admin/genres'),
    generations: require('./routes/admin/generations'),
    pages: require('./routes/admin/pages'),
    platforms: require('./routes/admin/platforms'),
    games: require('./routes/admin/games'),
    reviews: require('./routes/admin/reviews')
};

// define routes
const routes = {
    platforms: require('./routes/platforms'),
    generations: require('./routes/generations'),
    games: require('./routes/games'),
    page: require('./routes/page'),
    reviews: require('./routes/reviews')
};

// configure storage container for handling file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'web/uploads/');
    },

    // By default, Multer removes file extensions so let's put them back
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// middleware that adds an allow-origin header for the dev domain
const setOriginHeader = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:9010');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
};

// middleware that checks validity of the supplied token for accessTokenSecret
const verifyAccessToken = (req, res, next) => {
    if (req.cookies.accessToken) {
        const accessToken = req.cookies.accessToken;

        // verify the token
        jwt.verify(accessToken, accessTokenSecret, error => {
            if (error) {

                // user has no access, returning 403 to the caller. (this is usually expressRequest, which in turn
                // will throw an Error on which a redirect can be issued by the method calling expressRequest)
                return res.sendStatus(403);
            }

            // jwt validated okay, continue with api request
            next();
        });
    } else {

        // no accessToken provided, user is not logged in. returning 401 to the caller. (this is usually expressRequest,
        // which in turn will throw an Error on which a redirect can be issued by the method calling expressRequest)
        res.sendStatus(401);
    }
};

// async helper to verify hashed password using argon2
const verifyPassword = async (actualPassword, givenPassword) => {
    return await argon2.verify(actualPassword, givenPassword);
};

// async helper to find user in users table
const findUser = async email => {
    return await models.users.findOne({ where: { email } });
};

// async helper to generate argon2 password hash
const generatePassword = async password => {
    return await argon2.hash(password);
};

/* SPECIFIC API ROUTES */

// register
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    generatePassword(password).then(hashedPassword => {
        if (!hashedPassword) {
            throw new Error('Password hash could not be generated')
        }

        findUser(email).then(userRecord => {
            if (userRecord) {
                return res.status(409).json('UNIQUE_VIOLATION');
            }

            const data = {
                email,
                password: hashedPassword
            };

            // generate user since it did not exist yet
            models.users.create(data).then(newUser => {
                if (!newUser) {
                    throw new Error('User could not be created');
                }

                // User successfully created, FE should redirect to login'
                return res.status(200).json('ok');
            });
        }).catch(() => {

            // database error
            return res.status(500).json('INTERNAL_SERVER_ERROR');
        });
    }).catch(() => {

        // argon2 error
        return res.status(500).json('INTERNAL_SERVER_ERROR');
    });
});

// login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    findUser(email).then(userRecord => {
        if (!userRecord) {
            return res.status(401).json('UNAUTHORISED');
        }

        verifyPassword(userRecord.password, password).then(correctPassword => {
            if (!correctPassword) {
                return res.status(401).json('UNAUTHORISED');
            }

            const accessToken = jwt.sign({ email }, accessTokenSecret, { expiresIn: access_token_time_to_live });
            const refreshToken = jwt.sign({ email }, refreshTokenSecret, { expiresIn: refresh_token_time_to_live });

            // this sets the cookie in the browser (httpOnly ensures javascript cant access it)
            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });

            // this is stored in memory. so server down means everyone must log in again.
            refreshTokens.push(refreshToken); // todo: add a check so it doesnt add an existing refreshToken

            // while the access token was already returned as a cookie, it seems good practice to return it in the response too
            res.status(200).json({ accessToken });
        }).catch(() => {

            // argon2 error
            return res.status(500).json('INTERNAL_SERVER_ERROR');
        });
    }).catch(() => {

        // database error
        return res.status(500).json('INTERNAL_SERVER_ERROR');
    });
});

// logout (delete refresh token that matches the access token)
app.post('/logout', (req, res) => {
    const { refreshToken } = req.cookies;

    const newTokens = [];

    // todo: filter should work here, rewrite
    refreshTokens.forEach(t => {
        if (t !== refreshToken) {
            newTokens.push(t);
        }
    });

    refreshTokens = newTokens;

    return res.status(200).json('ok');
});

// validate provided token (this is to be called as a separate endpoint, before rendering a protected page)
app.get('/authenticate',
    verifyAccessToken,
    (req, res) => {

        // at this point there is a valid token. return it so frontend can set state so admin page is rendered
        // todo: I still dont like this
        res.json({ accessToken: req.cookies.accessToken });
    }
);

// refresh access token
app.post('/refreshtoken', (req, res) => {
    if (req.cookies.accessToken && req.cookies.refreshToken) {
        const refreshToken = req.cookies.refreshToken;

        // check if the refresh token is valid
        jwt.verify(refreshToken, refreshTokenSecret, (error, user) => {

            if (!~refreshTokens.indexOf(refreshToken)) {

                // refresh token does not exist on server
                return res.sendStatus(403);
            }

            if (error) {

                // could not verify refresh token
                return res.sendStatus(403);
            }

            // refresh token found and still valid, generate new accessToken
            const accessToken = jwt.sign({ email: user.email }, accessTokenSecret, { expiresIn: access_token_time_to_live });

            if (!accessToken) {

                // could not create new access token
                return res.sendStatus(403);
            }

            // this sets the refreshed access token as a cookie in the browser
            res.cookie('accessToken', accessToken, { httpOnly: true });

            // you probably dont need to send the accessToken back. the cookie already handles this for you.
            // todo: I still dont like this
            return res.status(200).json({
                accessToken
            });
        })
    } else {

        // not all cookies present in request
        return res.sendStatus(401);
    }
});

// file upload (froala images)
app.post('/api/admin/upload', cors(), (req, res) => {

    // 'upload' is the form field id that contains the image data
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('upload');

    return new Promise((resolve, reject) => {
        upload(req, res, err => {
            if (req.fileValidationError) {
                return reject(req.fileValidationError);
            }
            else if (!req.file) {
                return reject('Please select an image to upload');
            }
            else if (err instanceof multer.MulterError) {
                return reject(err);
            }
            else if (err) {
                return reject(err);
            }

            // upload successful, return constructed path
            res.status(201).json({ path: `/uploads/${req.file.filename}` });
        });
    });
});

/* DYNAMIC API ROUTES */

// protected api routes: call controller method (if it exists) for the matching route
for (const [routeName, routeController] of Object.entries(admin_routes)) {
	if (routeController.getAll) {
		app.get(
		    `/api/admin/${routeName}`,
            cors(),
            setOriginHeader,
            verifyAccessToken,
			routeController.getAll
		);
	}
	if (routeController.getById) {
        app.get(
			`/api/admin/${routeName}/:id`,
            cors(),
            setOriginHeader,
            verifyAccessToken,
			routeController.getById
		);
	}
	if (routeController.create) {
		app.post(
			`/api/admin/${routeName}`,
            cors(),
            setOriginHeader,
            verifyAccessToken,
			routeController.create
		);
	}
	if (routeController.update) {
		app.put(
			`/api/admin/${routeName}/:id`,
            cors(),
            setOriginHeader,
            verifyAccessToken,
			routeController.update
		);
	}
	if (routeController.remove) {
		app.delete(
			`/api/admin/${routeName}/:id`,
            cors(),
            setOriginHeader,
            verifyAccessToken,
			routeController.remove
		);
	}
}

// unprotected api routes: call controller method (if it exists) for the matching route (only GET is used here)
for (const [routeName, routeController] of Object.entries(routes)) {
    if (routeController.getAll) {
        app.get(
            `/api/${routeName}`,
            cors(),
            setOriginHeader,
            routeController.getAll
        );
    }
    if (routeController.getBySlug) {
        app.get(
            `/api/${routeName}/:slug`,
            cors(),
            setOriginHeader,
            routeController.getBySlug
        );
    }
}

module.exports = (app);
