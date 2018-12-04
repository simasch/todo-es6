import express from 'express';
import TodoRepository from './todoRepository';
import Todo from './todo';

let router = express.Router();
let todoRepository = new TodoRepository();

router.get('/', (req, res) => {
    todoRepository.findAll()
        .then((todos) => {
            return res.status(200).json(todos);
        });
});

router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id)
        .then((todo) => {
            if (todo) {
                return res.status(200).json(todo);
            } else {
                return res.status(404);
            }
        });
});

router.post('/', (req, res) => {

    if (!req.body.title) {
        return res.status(400).json({
            message: 'title is required'
        });
    } else if (!req.body.description) {
        return res.status(400).json({
            message: 'description is required'
        });
    }

    const todo = new Todo(null, req.body.title, req.body.description);

    todoRepository.insert(todo)
        .then((id) => {
            return res.status(201).header('Location', 'http://localhost:5000/api/v1/todos/' + id);
        });
});

router.put('/:id', (req, res) => {
    if (!req.body.title) {
        return res.status(400).json({
            message: 'title is required'
        });
    } else if (!req.body.description) {
        return res.status(400).json({
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
                        message: 'Todo update',
                    });
                });
        } else {
            return res.status(404);
        }
    });
});

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    todoRepository.findById(id).then((todo) => {
        if (todo) {
            const todo = new Todo(id, req.body.title, req.body.description);

            todoRepository.deleteById(id)
                .then(rs => {
                    return res.status(200).json({
                        message: 'todo deleted successfully'
                    });
                });
        } else {
            return res.status(404);
        }
    });
})

module.exports = router;