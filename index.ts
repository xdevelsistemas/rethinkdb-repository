import * as r from 'rethinkdb'
import * as shortid from 'shortid'

export namespace Database {
    export interface IModel<T> {
        id: T
    }

    export interface IRepository {
        connectionOptions: r.ConnectionOptions
        database: r.Db
        tableName: string
        createDatabase(databaseName: string): Promise<r.CreateResult>
        useDatabase(databaseName: string): void
        useTable(tableName: string): void
        dbExists(databaseName: string): Promise<boolean>
        tableCreate(): Promise<r.CreateResult>
        tableDrop(): Promise<r.DropResult>
        tableList(): Promise<Array<string>>
        filter(filter: any): Promise<r.Cursor>
        get(id: string): Promise<r.Cursor>
        getAll(): Promise<r.Cursor>
        exec<T>(fn: (table: r.Table) => any): Promise<T>
        delete(id: string): Promise<r.WriteResult>
        deleteRange(filter: any): Promise<r.WriteResult>
        insert(data: any): Promise<r.WriteResult>
        insertRange(data: Array<any>): Promise<r.WriteResult>
        update(data: any): Promise<r.WriteResult>
        updateRange(data: Array<any>): Promise<r.WriteResult>
    }

    export class Model implements IModel<string> {
        id: string
        constructor(id?: string) {
            if (!id) {
                this.id = Model.generateId()
            } else {
                this.id = id
            }
        }
        static generateId(): string {
            shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@')
            return shortid.generate()
        }
    }

    export class Repository implements IRepository {
        /**
         * 
         * 
         * @type {r.ConnectionOptions}
         * @memberOf Repository
         */
        connectionOptions: r.ConnectionOptions
        /**
         * Default database is passed at {connectionOptions}
         * 
         * @type {r.Db}
         * @memberOf Repository
         */
        database: r.Db
        /**
         * 
         * 
         * @type {string}
         * @memberOf Repository
         */
        tableName: string
        /**
         * Creates an instance of Repository.
         * 
         * @param {r.ConnectionOptions} connectionOptions
         * @param {string} tableName
         * 
         * @memberOf Repository
         */
        constructor(connectionOptions: r.ConnectionOptions, tableName: string) {
            this.connectionOptions = connectionOptions
            this.useDatabase(this.connectionOptions.db)
            this.useTable(tableName)
        }
        /**
         * Creates database at current connected server
         * 
         * @param {string} databaseName
         * @returns {Promise<r.CreateResult>}
         * 
         * @memberOf Repository
         */
        createDatabase(databaseName: string): Promise<r.CreateResult> {
            return this.getConnection().then(connection => {
                return r.dbCreate(databaseName).run(connection)
            })
        }
        /**
         * Changes de database being used
         * 
         * @param {string} databaseName
         * 
         * @memberOf Repository
         */
        useDatabase(databaseName: string): void {
            this.database = r.db(databaseName)
        }
        /**
         * 
         * 
         * @param {string} tableName
         * 
         * @memberOf Repository
         */
        useTable(tableName: string): void {
            this.tableName = tableName
        }
        /**
         * Verify if the database exists 
         * 
         * @param {string} databaseName
         * @returns {Promise<boolean>}
         * 
         * @memberOf Repository
         */
        dbExists(databaseName: string): Promise<boolean> {
            return this.getConnection().then(connection => {
                return r.dbList()
                    .run(connection)
                    .then((dbs) => {
                        return dbs.filter(d => d === databaseName).length > 0
                    })
            })
        }
        /**
         * Create {tableName} in database
         * 
         * @returns {Promise<r.CreateResult>}
         * 
         * @memberOf Repository
         */
        tableCreate(tableName?: string): Promise<r.CreateResult> {
            return this.getConnection().then(connection => {
                return this.database.tableCreate(tableName || this.tableName)
                    .run(connection)
            })
        }
        /**
         * Drop {tableName} from database
         * 
         * @returns {Promise<r.DropResult>}
         * 
         * @memberOf Repository
         */
        tableDrop(tableName?: string): Promise<r.DropResult> {
            return this.getConnection().then(connection => {
                return this.database.tableDrop(tableName || this.tableName)
                    .run(connection)
            })
        }
        /**
         * Get list of tables names at current database
         * 
         * @returns {Promise<Array<string>>}
         * 
         * @memberOf Repository
         */
        tableList(): Promise<Array<string>> {
            return this.getConnection().then(connection => {
                return this.database.tableList().run(connection)
            })
        }
        /**
         * Select objects from database with the specified filter
         * 
         * @param {*} filter
         * @returns {Promise<r.Cursor>}
         * 
         * @memberOf Repository
         */
        filter(filter: any): Promise<r.Cursor> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .filter(filter)
                    .run(connection)
            })
        }
        /**
         * Get object from database with specified {id}
         * 
         * @param {string} id
         * @returns {Promise<r.Cursor>}
         * 
         * @memberOf Repository
         */
        get(id: string): Promise<r.Cursor> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .get(id)
                    .run(connection)
            })
        }
        /**
         * Get all objects from {tableName}
         * 
         * @returns {Promise<r.Cursor>}
         * 
         * @memberOf Repository
         */
        getAll(): Promise<r.Cursor> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .run(connection)
            })
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
        exec<T>(fn: (table: r.Table) => any): Promise<T> {
            return this.getConnection().then(connection => {
                let table = this.getTable()
                let result = fn(table)
                if (result) {
                    return (result as r.Operation<T>).run(connection)
                }
                return result
            })
        }
        /**
         * Delete object from database with specified {id}
         * 
         * @param {string} id
         * @returns {Promise<r.WriteResult>}
         * 
         * @memberOf Repository
         */
        delete(id: string): Promise<r.WriteResult> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .get(id)
                    .delete()
                    .run(connection)
            })
        }
        /**
         * Select objects from database with the specified filter then remove them
         * 
         * @param {*} filter
         * @returns {Promise<r.WriteResult>}
         * 
         * @memberOf Repository
         */
        deleteRange(filter: any): Promise<r.WriteResult> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .filter(filter)
                    .delete()
                    .run(connection)
            })
        }
        /**
         * Insert object into database
         * 
         * @param {*} data
         * @returns {Promise<r.WriteResult>}
         * 
         * @memberOf Repository
         */
        insert(data: any): Promise<r.WriteResult> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .insert(data)
                    .run(connection)
            })
        }
        /**
         * Insert multiple objects into database
         * 
         * @param {Array<any>} data
         * @returns {Promise<r.WriteResult>}
         * 
         * @memberOf Repository
         */
        insertRange(data: Array<any>): Promise<r.WriteResult> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .insert(data)
                    .run(connection)
            })
        }
        /**
         * Update object in database
         * 
         * @param {*} data
         * @returns {Promise<r.WriteResult>}
         * 
         * @memberOf Repository
         */
        update(data: any): Promise<r.WriteResult> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .update(data)
                    .run(connection)
            })
        }
        /**
         * Update multiple objects in database
         * 
         * @param {Array<any>} data
         * @returns {Promise<r.WriteResult>}
         * 
         * @memberOf Repository
         */
        updateRange(data: Array<any>): Promise<r.WriteResult> {
            return this.getConnection().then(connection => {
                return this.getTable()
                    .update(data)
                    .run(connection)
            })
        }
        private getConnection(): Promise<r.Connection> {
            return r.connect(this.connectionOptions)
        }
        private getTable(): r.Table {
            return this.database.table(this.tableName)
        }
    }
}
