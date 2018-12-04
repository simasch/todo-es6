import express from 'express';
import TodoRepository from './todoRepository';
import Todo from './todo';

let router = express.Router();
let todoRepository = new TodoRepository();

router.get('/', (req, res) => {
    todoRepository.findAll()
        .then((todos) => {
            return res.status(200).json(todos);
        })
        .catch(reason => {
            return handleCatch(reason, res);
        });
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id)
        .then((todo) => {
            if (todo) {
                return res.status(200).json(todo);
            } else {
                return res.status(404).end();
            }
        })
        .catch(reason => {
            return handleCatch(reason, res);
        });
});

router.post('/', (req, res) => {
    let message = validate(req.body);

    if (message.length > 0) {
        return res.status(400).json({
            message: message
        });
    } else {
        todoRepository.insert(new Todo(null, req.body.title, req.body.description))
            .then((id) => {
                return res.status(201).header('Location', 'http://localhost:5000/api/v1/todos/' + id).end();
            })
            .catch(reason => {
                return handleCatch(reason, res);
            });
    }
});

router.put('/:id', (req, res) => {
    let message = validate(req.body);

    if (message.length > 0) {
        return res.status(400).json({
            message: message
        });
    } else {
        const id = parseInt(req.params.id, 10);

        todoRepository.findById(id)
            .then((todo) => {
                if (todo) {
                    const todo = new Todo(id, req.body.title, req.body.description);

                    todoRepository.update(todo)
                        .then((todo) => {
                            return res.status(204).end();
                        })
                        .catch(reason => {
                            return handleCatch(reason, res);
                        });
                } else {
                    return res.status(404).end();
                }
            })
            .catch(reason => {
                return handleCatch(reason, res);
            });
    }
});

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id)
        .then((todo) => {
            if (todo) {
                const todo = new Todo(id, req.body.title, req.body.description);

                todoRepository.deleteById(id)
                    .then(rs => {
                        return res.status(204).end();
                    })
                    .catch(reason => {
                        return handleCatch(reason, res);
                    });
            } else {
                return res.status(404).end();
            }
        })
        .catch(reason => {
            return handleCatch(reason, res);
        });
})

function validate(body) {
    let message = '';
    if (!body.title) {
        message += 'Title is required'
    }
    if (!body.description) {
        message += 'Description is required'
    }
    return message;
}

function handleCatch(reason, res) {
    console.log(reason);
    return res.status(500).end();
}

module.exports = router;