import express from 'express';
import bodyParser from 'body-parser';
import TodoApi from './todoApi';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const todoApi = new TodoApi(app);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

