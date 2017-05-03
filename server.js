
const express = require('express');
const morgan = require('morgan');

const app = express();

const blogRouter = require('./blogRouters');

// log the http layer
app.use(morgan('common'));

app.use('/blog-list', blogRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});