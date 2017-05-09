const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const queryParser = bodyParser.urlencoded({ extended: true });

const mongoose = require('mongoose');
const {BlogPost} = require('./models');



router.get('/', (req, res) => {
    BlogPost
    .find()
    .exec()
    .then(blogposts => {
        res.json({
            blogposts: blogposts.map(
                (blogpost) => blogpost.apiRepr())
        });
    })
    .catch(
        err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.get('/:id', (req, res) => {
    BlogPost
        .findById(req.params.id)
        .exec()
        .then(blogpost =>res.json(blogpost.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

router.post('/', jsonParser, (req, res) => {


    const requiredFields = ['title', 'content', 'author'];

    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }


    BlogPost
        .create({
            title: req.body.title,
            content: req.body.content,
            created: req.body.created || Date.now(),
            author: {
                    firstName: req.body.author.firstName,
                    lastName: req.body.author.lastName
                }
        })
        .then(
            blogpost => res.status(201).json(blogpost.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.put('/:id', jsonParser, (req, res) => {
    // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`);
        console.error(message);
        res.status(400).json({message: message});
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPost
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
        .findByIdAndUpdate(req.params.id, {$set: toUpdate})
        .exec()
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
    BlogPost
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;