import Todo from './todo';

const pgp = require('pg-promise')();

export default class TodoRepository {

    constructor() {
        this.db = pgp({database: 'todo', user: 'todo', password: 'todo'});
    }

    findAll() {
        return new Promise((resolve, reject) => {
            this.db.any('SELECT id, title, description FROM todo ORDER BY id')
                .then(data => {
                    resolve(this.convertToTodo(data));
                });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            this.db.oneOrNone('SELECT id, title, description FROM todo WHERE id = $1', [id])
                .then(data => {
                    if (data) {
                        resolve(new Todo(data.id, data.title, data.description));
                    } else {
                        resolve(null);
                    }
                });
        });
    }

    insert(todo) {
        return new Promise((resolve, reject) => {
            this.db.tx(t => {
                t.one('INSERT INTO todo(title, description) VALUES($1, $2) RETURNING id', [todo.title, todo.description])
                    .then(data => {
                        resolve(data.id);
                    });
            });
        });
    }

    update(todo) {
        return new Promise((resolve, reject) => {
            this.db.tx(t => {
                t.none('UPDATE todo SET title = $1, description = $2 WHERE id = $3', [todo.title, todo.description, todo.id]);
                resolve(todo);
            });
        });
    }

    deleteById(id) {
        return new Promise((resolve, reject) => {
            this.db.tx(t => {
                t.none('DELETE FROM todo WHERE id = $1', [id]);
                resolve();
            });
        });
    }

    convertToTodo(data) {
        let todos = [];
        for (let row of data) {
            todos.push(new Todo(row.id, row.title, row.description))
        }
        return todos;
    }

}