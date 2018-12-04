import express from 'express';
import bodyParser from 'body-parser';
import TodoController from './todo/todoController';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const todoApi = new TodoController(app);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

