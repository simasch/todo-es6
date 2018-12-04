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
                        client.query('select id, title, description from todo order by id')
                            .then(rs => {
                                let todos = [];
                                let rows = rs.rows;
                                for (let row of rows) {
                                    todos.push(new Todo(row.id, row.title, row.description))
                                }
                                release();
                                resolve(todos);
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
                        client.query('select id, title, description from todo where id = $1', [id])
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
                    const text = 'INSERT INTO todo(title, description) VALUES($1, $2) RETURNING *';
                    const values = [todo.title, todo.description];

                    client.query(text, values, (err, res) => {
                        release();
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.rows[0]);
                        }
                    });
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
                    client.query('update todo set title = $1, description = $2 where id = $3',
                        [todo.title, todo.description, todo.id])
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
                    client.query('delete from todo where id = $1', [id])
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
}