const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

function seedBlogData() {
    console.info('seeding blogpost data');
    const seedData = [];
    let rec = {};
    for (let i=1; i<=10; i++) {
        rec = generateBlogData();
        // console.log(rec)
        seedData.push(rec);
    }
    // this will return a promise
    return BlogPost.insertMany(seedData);
}

function generateBlogData() {
    let currTime = new Date().getTime();
    return {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        created: currTime//faker.date.recent()
    }
}
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function() {

    before(function () {
        return runServer();
    });
    beforeEach(function() {
        return seedBlogData();
    });
    afterEach(function() {
        return tearDownDb();
    });
    after(function () {
        return closeServer();
    });
    describe('GET endpoint', function() {
        it('should return all existing posts', function () {
            let res;
            return chai.request(app)
                .get('/blogposts')
                .then(function (_res) {
                    res = _res;
                    res.should.have.status(200);
                    res.body.blogposts.should.have.length.of.at.least(1);
                    return BlogPost.count();
                    })
                .then(function(count) {
                    res.body.blogposts.should.have.length.of(count);
                });
        });
        it('should return blog post with right fields', function () {
            let resBlog;
            const validData = {};

            return chai.request(app)
                .get('/blogposts')
                .then(function (res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.blogposts.should.be.a('array');
                    res.body.blogposts.should.have.length.of.at.least(1);

                    res.body.blogposts.forEach(function(post) {
                        post.should.be.a('object');
                        post.should.include.keys(
                            'id', 'title', 'content', 'author', 'created');
                    });
                    resBlog = res.body.blogposts[0];
                    return BlogPost.findById(resBlog.id);

                })
                .then(function (res) {
                    // console.log(res)
                    // console.log(resBlog)
                    resBlog.id.should.equal(res.id);
                    resBlog.title.should.equal(res.title);
                    let name = res.author.firstName + " " + res.author.lastName;

                    resBlog.author.should.equal(name);
                    resBlog.created.should.equal(res.created);
                    resBlog.content.should.equal(res.content);
                });
        });
    });
    describe('POST endpoint', function() {
        it('should add a new post', function () {
            const newPost = generateBlogData();
            // console.log("\n\n")
            // console.log("newPost==")
            // console.log(newPost)
            // console.log("\n\n")
            //const newItem = {title: 'Title03', content: 'Content03', author: 'Author03'};
            return chai.request(app)
                .post('/blogposts')
                .send(newPost)
                .then(function (res) {
                    // console.log("\n\n")
                    // console.log("res.body==")
                    // console.log(res.body)
                    // console.log("\n\n")

                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys('id', 'title', 'content', 'author', 'created');
                    return BlogPost.findById(res.body.id);
                }).then(function(post) {
                    // console.log("\n\n")
                    // console.log("post==")
                    // console.log(post)
                    // console.log("\n\n")

                    post.title.should.equal(newPost.title);
                    post.author.firstName.should.equal(newPost.author.firstName);
                    post.author.lastName.should.equal(newPost.author.lastName);
                    post.created.should.equal(newPost.created.toString());
                    post.content.should.equal(newPost.content);
                });
        });
    });
    describe('PUT endpoint', function() {

        it('should update fields you send over', function () {
            const updateData = {
                title: 'manish jaiswal update'
            }
            return BlogPost
                .findOne()
                .exec()
                .then(function(post) {
                    updateData.id = post.id;

                    // make request then inspect it to make sure it reflects
                    // data we sent
                    return chai.request(app)
                        .put(`/blogposts/${post.id}`)
                        .send(updateData);
                })
                .then(function(res) {
                    res.should.have.status(204);

                    return BlogPost.findById(updateData.id).exec();
                })
                .then(function(dbPost) {
                    dbPost.title.should.equal(updateData.title);
                });
        });
    });
    describe('DELETE endpoint', function() {
        it('should delete items on DELETE', function () {
            let post;
            return BlogPost
                .findOne()
                .exec()
                .then(function(_post) {
                    post = _post;
                    return chai.request(app).delete(`/blogposts/${post.id}`);
                })
                .then(function(res) {
                    res.should.have.status(204);
                    return BlogPost.findById(post.id).exec();
                })
                .then(function(_res) {
                    should.not.exist(_res);
                });
        });
    });

});