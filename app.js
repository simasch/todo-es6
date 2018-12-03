import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import Todo from './todo';

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
            let todos = [];
            let rows = rs.rows;
            for (let row of rows) {
                todos.push(new Todo(row.id, row.title, row.description))
            }
            return res.status(200).send({
                todos
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

    const findById = {
        name: 'findById',
        text: 'select id, title, description from todo where id = $1',
        values: [id]
    }

    client.query(findById)
        .then(rs => {
            if (rs.rows.length == 1) {
                let row = rs.rows[0];
                let content = req.body;

                if (!content.title) {
                    return res.status(400).send({
                        success: 'false',
                        message: 'title is required',
                    });
                } else if (!content.description) {
                    return res.status(400).send({
                        success: 'false',
                        message: 'description is required',
                    });
                }

                const query = {
                    name: 'update',
                    text: 'update todo set title = $1, description = $2 where id = $3',
                    values: [row.title, row.description, row.id]
                }

                client.query(query)
                    .then(rs => {
                        return res.status(201).send({
                            success: 'true',
                            message: 'todo updated successfully'
                        });
                    })
                    .catch(e => {
                        console.error(e);
                        return res.status(500).send({
                            success: 'false',
                            message: e.message
                        })
                    })
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

app.delete('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    const query = {
        name: 'delete',
        text: 'delete from todo where id = $1',
        values: [id]
    }

    client.query(query)
        .then(rs => {
            return res.status(200).send({
                success: 'true',
                message: 'todo deleted successfully'
            });
        })
        .catch(e => {
            console.error(e);
            return res.status(500).send({
                success: 'false',
                message: e.message
            })
        })
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});


