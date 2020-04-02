import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';

const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// CORS:
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).send();
        return;
    }
    next();
});

app.use(routes);

app.listen(port, () => {
    console.log(`Now listening to port ${port}`);
});

process
    .on('unhandledRejection', exception => {
        console.log('Unhandled rejection at Promise');
        console.log(exception.toString());
        console.log(exception.stack);
    })
    .on('uncaughtException', exception => {
        console.log('Uncaught exception thrown');
        console.log(exception.toString());
        console.log(exception.stack);
    });
