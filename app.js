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

    client.query('select id, title, description from todo')
        .then(rs => {
            return res.status(200).send({
                todos: rs.rows
            })
        })
        .catch(e => {
            console.error(e);
            return res.status(500).send({
                success: 'false',
                message: e.message
            })
        })
});

app.get('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    const query = {
        name: 'findById',
        text: 'select id, title, description from todo where id = $1',
        values: [id]
    }
    client.query(query)
        .then(rs => {
            if (rs.rows.length == 1) {
                let row = rs.rows[0];
                return res.status(200).send(
                    row
                );
            } else if (rs.rows.length == 0) {
                return res.status(404).send({
                    success: 'false',
                    message: 'todo does not exist',
                });
            } else {
                return res.status(500).send({
                    success: 'false',
                    message: 'More than one row found!'
                })
            }
        })
        .catch(e => {
            console.error(e);
            return res.status(500).send({
                success: 'false',
                message: e.message
            })
        })
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

    const text = 'INSERT INTO todo(title, description) VALUES($1, $2) RETURNING *'
    const values = [req.body.title, req.body.description]

    let todo;
    client.query(text, values, (err, res) => {
        if (err) {
            console.log(err.stack);
        } else {
            todo = res.rows[0];
        }
    });

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


