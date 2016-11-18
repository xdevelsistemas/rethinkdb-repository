"use strict";
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const util = require('gulp-util');
const index_1 = require('./index');
class DatabaseTest {
    constructor(repository) {
        this.repository = repository;
    }
    run() {
        chai.use(chaiAsPromised);
        chai.should();
        let elemento = new index_1.Database.Model();
        let elementos = [
            new index_1.Database.Model(),
            new index_1.Database.Model(),
            new index_1.Database.Model()
        ];
        describe('#Testando criacao de tabela', () => {
            it('Criando a tabela teste', () => {
                return this.repository.tableCreate()
                    .should.eventually.fulfilled;
            });
        });
        describe('#Testando insercao de dados', () => {
            it('Inserindo um elemento', () => {
                return this.repository.insert(elemento)
                    .should.eventually.fulfilled;
            });
            it('Inserindo varios elementos', () => {
                return this.repository.insertRange(elementos)
                    .should.eventually.fulfilled;
            });
        });
        describe('#Testando recuperacao de dados', () => {
            it('Listando um elemento', () => {
                return this.repository.get(elemento.id)
                    .should.eventually.fulfilled;
            });
            it('Listando tudo com exec(getAll())', () => {
                return this.repository.exec((table) => {
                    return table;
                })
                    .then((cursor) => {
                    let elementos = new Array();
                    cursor.toArray((err, data) => {
                        if (err) {
                            util.log(err);
                        }
                        data.map(d => {
                            elementos.push(d);
                        });
                    });
                    return Promise.resolve(elementos);
                })
                    .should.eventually.be.instanceof(Array)
                    .have.property('length').eq(4);
            });
        });
        describe('#Testando remocao de dados', () => {
            it('Deletando um elemento', () => {
                return this.repository.delete(elemento.id)
                    .should.eventually.fulfilled;
            });
            it('Deletando varios elementos', () => {
                return this.repository.deleteRange({ id: elementos[0].id })
                    .should.eventually.fulfilled;
            });
        });
        describe('#Testando remocao de tabela', () => {
            it('Deletando a tabela teste', () => {
                return this.repository.tableDrop()
                    .should.eventually.fulfilled;
            });
        });
    }
}
exports.DatabaseTest = DatabaseTest;
