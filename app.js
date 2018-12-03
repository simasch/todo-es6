import express from 'express';
import bodyParser from 'body-parser';
import TodoRepository from './todoRepository';
import Todo from './todo';

// Set up the express app
const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const todoRepository = new TodoRepository();

// get all todos
app.get('/api/v1/todos', (req, res) => {
    todoRepository.findAll()
        .then((todos) => {
            return res.status(200).json(todos);
        })
        .catch(e => {
            return send500(e, res);
        });
});

app.get('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id)
        .then((todo) => {
            if (todo) {
                return res.status(200).json(todo);
            } else {
                return send404(res);
            }
        })
        .catch(e => {
            return send500(e, res);
        });
})
;

app.post('/api/v1/todos', (req, res) => {

    if (!req.body.title) {
        return res.status(400).json({
            success: 'false',
            message: 'title is required'
        });
    } else if (!req.body.description) {
        return res.status(400).json({
            success: 'false',
            message: 'description is required'
        });
    }

    const todo = new Todo(req.body.title, req.body.description);

    todoRepository.insert(todo)
        .then((todo) => {
            return res.status(201).json({
                success: 'true',
                message: 'Todo created',
            });
        })
        .catch(e => {
            return send500(e, res);
        });
});

app.put('/api/v1/todos/:id', (req, res) => {
    if (!req.body.title) {
        return res.status(400).json({
            success: 'false',
            message: 'title is required'
        });
    } else if (!req.body.description) {
        return res.status(400).json({
            success: 'false',
            message: 'description is required'
        });
    }

    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id).then((todo) => {
        if (todo) {
            const todo = new Todo(id, req.body.title, req.body.description);

            todoRepository.update(todo)
                .then((todo) => {
                    return res.status(200).json({
                        success: 'true',
                        message: 'Todo update',
                    });
                })
                .catch(e => {
                    return send500(e, res);
                });
        } else {
            return send404(res);
        }
    });
});

app.delete('/api/v1/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id).then((todo) => {
        if (todo) {
            const todo = new Todo(id, req.body.title, req.body.description);

            todoRepository.deleteById(id)
                .then(rs => {
                    return res.status(200).json({
                        success: 'true',
                        message: 'todo deleted successfully'
                    });
                })
                .catch(e => {
                    return send500(e, res);
                });
        } else {
            return send404(res);
        }
    });
});

function send500(e, res) {
    console.error(e);
    return res.status(500).json({
        success: 'false',
        message: e.message
    })
}

function send404(res) {
    return res.status(404).json({
        success: 'false',
        message: 'Todo does not exist',
    });
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

