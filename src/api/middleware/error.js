/**
 * Gracefully handles unhandled exceptions
 */
// `next` needs to be there even if it's unused, because the `express` library does metaprogramming with it
export default (err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.log('Unhandled exception');
    console.log(err.toString());
    console.log(err.stack);
    
    if (!res.headersSent) {
        res.status(500).send();
    }
};
