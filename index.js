"use strict";
const r = require('rethinkdb');
const shortid = require('shortid');
var Database;
(function (Database) {
    class Model {
        constructor(id) {
            if (!id) {
                this.id = Model.generateId();
            }
            else {
                this.id = id;
            }
            this.dataInclusao = new Date();
        }
        static generateId() {
            shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
            return shortid.generate();
        }
    }
    Database.Model = Model;
    class Repository {
        /**
         * Creates an instance of Repository.
         *
         * @param {r.ConnectionOptions} connectionOptions
         * @param {string} tableName
         *
         * @memberOf Repository
         */
        constructor(connectionOptions, tableName) {
            this.connectionOptions = connectionOptions;
            this.database = r.db(this.connectionOptions.db);
            this.tableName = tableName;
        }
        /**
         * Create {tableName} in database
         *
         * @returns {Promise<r.CreateResult>}
         *
         * @memberOf Repository
         */
        tableCreate() {
            return this.getConnection().then(connection => {
                return this.database.tableCreate(this.tableName)
                    .run(connection);
            });
        }
        /**
         * Drop {tableName} from database
         *
         * @returns {Promise<r.DropResult>}
         *
         * @memberOf Repository
         */
        tableDrop() {
            return this.getConnection().then(connection => {
                return this.database.tableDrop(this.tableName)
                    .run(connection);
            });
        }
        /**
         * Get object from database with specified {id}
         *
         * @param {string} id
         * @returns {Promise<r.Cursor>}
         *
         * @memberOf Repository
         */
        get(id) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .get(id)
                    .run(connection);
            });
        }
        /**
         * Get all objects from {tableName}
         *
         * @returns {Promise<r.Cursor>}
         *
         * @memberOf Repository
         */
        getAll() {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .run(connection);
            });
        }
        /**
         * Give access to {tableName} allowing the use of complex queries with rethinkdb methods
         *
         * @template T
         * @param {(table: r.Table) => any} fn
         * @returns {Promise<T>}
         *
         * @memberOf Repository
         */
        exec(fn) {
            return this.getConnection().then(connection => {
                let table = this.getTable();
                let result = fn(table);
                if (result) {
                    return result.run(connection);
                }
                return result;
            });
        }
        /**
         * Delete object from database with specified {id}
         *
         * @param {string} id
         * @returns {Promise<r.WriteResult>}
         *
         * @memberOf Repository
         */
        delete(id) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .get(id)
                    .delete()
                    .run(connection);
            });
        }
        /**
         * Select objects from database with the specified filter then remove them
         *
         * @param {*} filter
         * @returns {Promise<r.WriteResult>}
         *
         * @memberOf Repository
         */
        deleteRange(filter) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .filter(filter)
                    .delete()
                    .run(connection);
            });
        }
        /**
         * Insert object into database
         *
         * @param {*} data
         * @returns {Promise<r.WriteResult>}
         *
         * @memberOf Repository
         */
        insert(data) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .insert(data)
                    .run(connection);
            });
        }
        /**
         * Insert multiple objects into database
         *
         * @param {Array<any>} data
         * @returns {Promise<r.WriteResult>}
         *
         * @memberOf Repository
         */
        insertRange(data) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .insert(data)
                    .run(connection);
            });
        }
        /**
         * Update object in database
         *
         * @param {*} data
         * @returns {Promise<r.WriteResult>}
         *
         * @memberOf Repository
         */
        update(data) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .update(data)
                    .run(connection);
            });
        }
        /**
         * Update multiple objects in database
         *
         * @param {Array<any>} data
         * @returns {Promise<r.WriteResult>}
         *
         * @memberOf Repository
         */
        updateRange(data) {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .update(data)
                    .run(connection);
            });
        }
        getConnection() {
            return r.connect(this.connectionOptions);
        }
        getTable() {
            return this.database.table(this.tableName);
        }
    }
    Database.Repository = Repository;
})(Database = exports.Database || (exports.Database = {}));
