import express from 'express';
import TodoRepository from './todoRepository';
import Todo from './todo';

let router = express.Router();
let todoRepository = new TodoRepository();

router.get('/', async (req, res, next) => {
    try {
        const todos = await todoRepository.findAll();

        return res.status(200).json(todos);
    } catch (e) {
        next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        const todo = await todoRepository.findById(id);

        if (todo) {
            return res.status(200).json(todo);
        } else {
            return res.status(404).end();
        }
    } catch (e) {
        next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        let message = validate(req.body);

        if (message.length > 0) {
            return res.status(400).json({message: message});
        } else {
            const id = await todoRepository.insert(new Todo(null, req.body.title, req.body.description));

            return res.status(201).header('Location', 'http://localhost:5000/api/v1/todos/' + id).end();
        }
    } catch (e) {
        next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        let message = validate(req.body);

        if (message.length > 0) {
            return res.status(400).json({message: message});
        } else {
            const id = parseInt(req.params.id, 10);

            let todo = await todoRepository.findById(id);
            if (todo) {
                await todoRepository.update(new Todo(todo.id, req.body.title, req.body.description));

                return res.status(204).end();
            } else {
                return res.status(404).end();
            }
        }
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);

        let todo = await todoRepository.findById(id);
        if (todo) {
            await todoRepository.deleteById(id);

            return res.status(204).end();
        } else {
            return res.status(404).end();
        }
    } catch (e) {
        next(e);
    }
});

function validate(body) {
    let message = '';
    if (!body.title) {
        message += 'Title is required';
    }
    if (!body.description) {
        message += 'Description is required';
    }
    return message;
}

export default router;