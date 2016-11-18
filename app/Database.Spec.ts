import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as util from 'gulp-util'
import {Database} from './Database'
import * as r from 'rethinkdb'

export class DatabaseTest {
    repository: Database.IRepository
    constructor(repository: Database.IRepository) {
        this.repository = repository
    }
    run(): void {
        chai.use(chaiAsPromised)
        chai.should()

        let elemento = new Database.Model()
        let elementos = [
            new Database.Model(),
            new Database.Model(),
            new Database.Model()
        ]
        
        describe('#Testando criacao de tabela', () => {
            it('Criando a tabela teste', () => {
                return this.repository.tableCreate()
                    .should.eventually.fulfilled
            })
        })

        describe('#Testando insercao de dados', () => {
            it('Inserindo um elemento', () => {
                return this.repository.insert(elemento)
                    .should.eventually.fulfilled
            })
            it('Inserindo varios elementos', () => {
                return this.repository.insertRange(elementos)
                    .should.eventually.fulfilled
            })
        })

        describe('#Testando recuperacao de dados', () => {
            it('Listando um elemento', () => {
                return this.repository.get(elemento.id)
                    .should.eventually.fulfilled
            })
            it('Listando tudo com exec(getAll())', () => {
                return this.repository.exec((table) => {
                    return table
                })
                .then((cursor: r.Cursor) => {
                    let elementos: Array<any> = new Array<any>()
                    cursor.toArray((err, data) => {
                        if (err) {
                            util.log(err)
                        }
                        data.map(d => {
                            elementos.push(d)
                        })
                    })
                    return Promise.resolve(elementos)
                })
                .should.eventually.be.instanceof(Array)
                .have.property('length').eq(4)
            })
        })

        describe('#Testando remocao de dados', () => {
            it('Deletando um elemento', () => {
                return this.repository.delete(elemento.id)
                    .should.eventually.fulfilled
            })
            it('Deletando varios elementos', () => {
                return this.repository.deleteRange({id: elementos[0].id})
                    .should.eventually.fulfilled
            })
        })

        describe('#Testando remocao de tabela', () => {
            it('Deletando a tabela teste', () => {
                return this.repository.tableDrop()
                    .should.eventually.fulfilled
            })
        })
    }
}