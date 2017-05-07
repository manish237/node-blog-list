const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Blog List', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });
    it('should list items on GET', function() {
        return chai.request(app)
            .get('/blog-list')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');

                res.body.length.should.be.at.least(1);
                const expectedKeys = ['id', 'title', 'content', 'author','publishDate'];
                res.body.forEach(function(item) {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    });
    it('should get item with specific ID on GET', function() {
        const validData = {};

        return chai.request(app)
            .get('/blog-list')
            .then(function(res) {
                validData.id = res.body[0].id;
                validData.title = res.body[0].title;
                validData.content = res.body[0].content;
                validData.author = res.body[0].author;
                validData.publishDate = res.body[0].publishDate
                return chai.request(app)
                    .get(`/blog-list?id=${validData.id}`)
                    .send(validData);
            })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(validData);
            });
    });


    it('should add an item on POST', function() {
        const newItem = {title: 'Title03',content : 'Content03', author:  'Author03'};
        return chai.request(app)
            .post('/blog-list')
            .send(newItem)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'title', 'content', 'author','publishDate');
                res.body.id.should.not.be.null;
                // response should be deep equal to `newItem` from above if we assign
                // `id` to it from `res.body.id`
                res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id},{publishDate: res.body.publishDate}));
            });
    });

    it('should not add an item missing mandatory field on POST', function() {
        const newItem = {title: 'Title03'};
        return chai.request(app)
            .post('/blog-list')
            .send(newItem)
            .catch(function (err) {
                err.should.have.status(400);
            })
    });

    it('should update items on PUT', function() {
        const updateData = {
            title: 'Title04',content : 'Content04', author:  'Author04'
        };

        return chai.request(app)
            .get('/blog-list')
            .then(function(res) {
                updateData.id = res.body[0].id;
                updateData.publishDate = res.body[0].publishDate
                return chai.request(app)
                    .put(`/blog-list/${updateData.id}`)
                    .send(updateData);
            })
            // prove that the PUT request has right status code
            // and returns updated item
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(updateData);
            });
    });

    it('should delete items on DELETE', function() {
        return chai.request(app)
            .get('/blog-list')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/blog-list/${res.body[0].id}`);
            })
            .then(function(res) {
                res.should.have.status(204);
            });
    });


});