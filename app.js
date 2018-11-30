import express from 'express';
import bodyParser from 'body-parser';
import db from './db/db';
import pg from 'pg';

// Set up PostgreSQL
const client = new pg.Client({
    connectionString: 'postgresql://todo:todo@localhost:5432/todo',
});
client.connect();

// Set up the express app
const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// get all todos
app.get('/api/v1/todos', (req, res) => {

    client.query('select title, description from todo')
        .then(rs => {
            return res.status(200).send({
                success: 'true',
                message: 'todos retrieved successfully',
                todos: rs.rows
            })
        })
        .catch(e => {
            console.error(e);
            return res.status(500).send({
                success: 'false',
                messsage: e.message
            })
        })
});

app.get('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    let todoFromDb;

    db.map((todo) => {
        if (todo.id === id) {
            todoFromDb = todo;
        }
    });
    if (todoFromDb) {
        return res.status(200).send({
            success: 'true',
            message: 'todo retrieved successfully',
            todoFromDb,
        });
    } else {
        return res.status(404).send({
            success: 'false',
            message: 'todo does not exist',
        });
    }
});

app.post('/api/v1/todos', (req, res) => {
    if (!req.body.title) {
        return res.status(400).send({
            success: 'false',
            message: 'title is required'
        });
    } else if (!req.body.description) {
        return res.status(400).send({
            success: 'false',
            message: 'description is required'
        });
    }

    const todo = {
        id: db.length + 1,
        title: req.body.title,
        description: req.body.description
    }

    db.push(todo);

    return res.status(201).send({
        success: 'true',
        message: 'todo added successfully',
        todo
    })
});

app.put('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let todoFound;
    let itemIndex;
    db.map((todo, index) => {
        if (todo.id === id) {
            todoFound = todo;
            itemIndex = index;
        }
    });

    if (!todoFound) {
        return res.status(404).send({
            success: 'false',
            message: 'todo not found',
        });
    }

    let content = req.body;
    console.log(content.title);
    console.log(content.description);

    if (!req.body.title) {
        return res.status(400).send({
            success: 'false',
            message: 'title is required',
        });
    } else if (!req.body.description) {
        return res.status(400).send({
            success: 'false',
            message: 'description is required',
        });
    }

    const updatedTodo = {
        id: todoFound.id,
        title: req.body.title || todoFound.title,
        description: req.body.description || todoFound.description,
    };

    db.splice(itemIndex, 1, updatedTodo);

    return res.status(201).send({
        success: 'true',
        message: 'todo added successfully',
        updatedTodo,
    });
});

app.delete('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    db.map((todo, index) => {
        if (todo.id === id) {
            db.splice(index, 1);
            return res.status(200).send({
                success: 'true',
                message: 'Todo deleted successfuly',
            });
        }
    });

    return res.status(404).send({
        success: 'false',
        message: 'todo not found',
    });


});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});


