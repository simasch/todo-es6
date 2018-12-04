import pgp from 'pg-promise';

export default class TodoRepository {

    constructor() {
        this.db = pgp()({database: 'todo', user: 'todo', password: 'todo'});
    }

    async findAll() {
        return await this.db.any('SELECT id, title, description FROM todo ORDER BY id');
    }

    async findById(id) {
        return await this.db.oneOrNone('SELECT id, title, description FROM todo WHERE id = $1', [id]);
    }

    async insert(todo) {
        let id;

        await this.db
            .tx(async t => {
                const data = await t.one('INSERT INTO todo(title, description) VALUES($1, $2) RETURNING id', [todo.title, todo.description]);
                id = data.id;
            });

        return id;
    }

    async update(todo) {
        await this.db
            .tx(async t => {
                await t.none('UPDATE todo SET title = $1, description = $2 WHERE id = $3', [todo.title, todo.description, todo.id]);
            });

        return todo;
    }

    async deleteById(id) {
        await this.db
            .tx(async t => {
                await t.none('DELETE FROM todo WHERE id = $1', [id]);
            });
    }

}