import TodoRepository from './todoRepository';
import Todo from './todo';

export default class TodoController {

    constructor(app) {
        this.todoRepository = new TodoRepository();

        app.get('/api/v1/todos', (req, res) => {
            this.todoRepository.findAll()
                .then((todos) => {
                    return res.status(200).json(todos);
                });
        });

        app.get('/api/v1/todos/:id', (req, res) => {
            const id = parseInt(req.params.id, 10);

            this.todoRepository.findById(id)
                .then((todo) => {
                    if (todo) {
                        return res.status(200).json(todo);
                    } else {
                        return this.notFound(res);
                    }
                });
        });

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

            const todo = new Todo(null, req.body.title, req.body.description);

            this.todoRepository.insert(todo)
                .then((todo) => {
                    return res.status(201).json({
                        success: 'true',
                        message: 'Todo created',
                    });
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

            this.todoRepository.findById(id).then((todo) => {
                if (todo) {
                    const todo = new Todo(id, req.body.title, req.body.description);

                    this.todoRepository.update(todo)
                        .then((todo) => {
                            return res.status(200).json({
                                success: 'true',
                                message: 'Todo update',
                            });
                        });
                } else {
                    return this.notFound(res);
                }
            });
        });

        app.delete('/api/v1/todos/:id', (req, res) => {
            const id = parseInt(req.params.id, 10);

            this.todoRepository.findById(id).then((todo) => {
                if (todo) {
                    const todo = new Todo(id, req.body.title, req.body.description);

                    this.todoRepository.deleteById(id)
                        .then(rs => {
                            return res.status(200).json({
                                success: 'true',
                                message: 'todo deleted successfully'
                            });
                        });
                } else {
                    return this.notFound(res);
                }
            });
        });
    }

    static notFound(res) {
        return res.status(404).json({
            success: 'false',
            message: 'Todo does not exist',
        });
    }

}

