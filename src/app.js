import express from 'express';
import bodyParser from 'body-parser';
import todoController from './todo/todoController';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    console.log(req.method + ' ' + req.url);
    next();
});


app.use('/api/v1/todos', todoController);

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.log(err);
    res.status(500).end();
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

