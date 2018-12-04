import pg from 'pg';
import Todo from './todo';

export default class TodoRepository {

    constructor() {
        this.pool = new pg.Pool({
            connectionString: 'postgresql://todo:todo@localhost:5432/todo',
        });
    }

    findAll() {
        return new Promise((resolve, reject) => {
                this.pool.connect((err, client, release) => {
                    if (err) {
                        release();
                        reject(err);
                    } else {
                        client.query('SELECT id, title, description FROM todo ORDER BY id')
                            .then(rs => {
                                release();
                                resolve(this.convertRsToTodos(rs));
                            })
                            .catch(e => {
                                release();
                                reject(e);
                            });
                    }
                });
            }
        );
    }

    findById(id) {
        return new Promise((resolve, reject) => {
                this.pool.connect((err, client, release) => {
                    if (err) {
                        release();
                        reject(err);
                    } else {
                        client.query('SELECT id, title, description FROM todo WHERE id = $1', [id])
                            .then(rs => {
                                release();
                                if (rs.rows.length === 1) {
                                    let row = rs.rows[0];
                                    resolve(new Todo(row.id, row.title, row.description));
                                } else if (rs.rows.length === 0) {
                                    resolve(null);
                                } else {
                                    reject('More than one row found!');
                                }
                            })
                            .catch(e => {
                                release();
                                reject(e);
                            });
                    }
                });
            }
        );
    }

    insert(todo) {
        return new Promise((resolve, reject) => {
            this.pool.connect((err, client, release) => {
                if (err) {
                    release();
                    reject(err);
                } else {
                    client.query('INSERT INTO todo(title, description) VALUES($1, $2) RETURNING id', [todo.title, todo.description])
                        .then(rs => {
                            release();
                            if (err) {
                                reject(err);
                            } else {
                                resolve(rs.rows[0].id);
                            }
                        })
                        .catch(e => {
                            release();
                            reject(e);
                        })
                    ;
                }
            });
        });
    }

    update(todo) {
        return new Promise((resolve, reject) => {
            this.pool.connect((err, client, release) => {
                if (err) {
                    release();
                    reject(err);
                } else {
                    client.query('UPDATE todo SET title = $1, description = $2 WHERE id = $3', [todo.title, todo.description, todo.id])
                        .then(rs => {
                            release();
                            resolve(todo);
                        })
                        .catch(e => {
                            release();
                            reject(e);
                        })
                }
            });
        });
    }

    deleteById(id) {
        return new Promise((resolve, reject) => {
            this.pool.connect((err, client, release) => {
                if (err) {
                    release();
                    reject(err);
                } else {
                    client.query('DELETE FROM todo WHERE id = $1', [id])
                        .then(rs => {
                            release();
                            resolve();
                        })
                        .catch(e => {
                            release();
                            reject(e);
                        })
                }
            });
        });
    }

    convertRsToTodos(rs) {
        let todos = [];
        for (let row of rs.rows) {
            todos.push(new Todo(row.id, row.title, row.description))
        }
        return todos;
    }

}