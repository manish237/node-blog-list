const mongoose = require('mongoose');

var nameSchema = mongoose.Schema({
    firstName: String,
    lastName: String
});

const blogPostSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: nameSchema, required: true},
    created: {type: String}
});

function StorageException(message) {
    this.message = message;
    this.name = "StorageException";
}

blogPostSchema.virtual('authorNameString').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim()});

blogPostSchema.methods.apiRepr = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorNameString,
        created: this.created
    };
}

const BlogPost = mongoose.model('Blogposts', blogPostSchema);

module.exports = {BlogPost};
