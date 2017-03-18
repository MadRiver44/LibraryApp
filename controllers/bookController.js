// we import these because we need to access the models for queries
var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

// Displaying the site welcome page
exports.index = function(req, res, next) {
  /*
    async parallel is passed an object with functions for getting counts of each of
    our models. they all start at the same time, when done the final callback is called
    with results passed as an object of the functions results.
  */

  async.parallel({
    book_count: function(callback) {
      Book.count(callback);
    },
    book_instance_count: function(callback) {
      BookInstance.count(callback);
    },
    book_instance_available_count: function(callback) {
      BookInstance.count({status: 'Available'}, callback);
    },
    author_count: function(callback) {
      Author.count(callback);''
    },
    genre_count: function(callback) {
      Genre.count(callback);
    },
  }, function(err, results) {
      // we specify outr view-- index.pug , title, error are vsriable thar=t are passed to the template
      // data is supplied as key: value pairs
      res.render('index', {title: 'Local Library Home', error: err, data: results });
  });
};

// Display a list of all books
exports.book_list = function(req, res, next) {
  /* we use the models find() metod to return all book objects, selecting to return
    only TITLE and AUTHOR(LINE 47). It will also return the _id and virtual fields.
    we call populate on Book specifying the author field -- this will replace the
    stored author id with full author details.
  */
  Book.find({}, 'title author ')
  /*
  when using mongoose, documents can either be retrieved using helpers. Every model method that
  accepts query conditions, can be executed by either a callback or exec()
  thus, when you dont pass a callback, you can build a query and eventually
  execute it. MONGOOSE QUERIES ARE NOT PROMISES, QUERIES DONT RETURN A THENABLE.*/
    .populate('author')
    .exec(function(err, list_books) {
     // console.log(list_books);
      if(err) {
        return next(err);
      }// Succssful so render in book_list.pug view
      res.render('book_list', {title: 'Book List', book_list: list_books });
    });
  };

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {
  // we're doing a quesry on Book model and BookInstance Model, the results are then passed
  // to the final callback in the results objects
  // the call back is the ame as above, it's passed an err and results, the results
  // are an array formed in the book obkect and accessed in the final results callback below
  async.parallel({
    book: function(callback) {
      console.log(callback);
      Book.findById(req.params.id)
    // populate the author and genre id columns with associated info from Author and Genre Models
        .populate('author')
        .populate('genre')
        .exec(callback)
    },
    book_instance: function(callback) {
      BookInstance.find({ 'book': req.params.id })
      // .populate('book')
      .exec(callback);
    },
  }, function(err, results) {
    if(err) {
      return next(err);
    }// Successful so render
    res.render('book_detail', {title: 'Title', book: results.book, book_instances: results.book_instance });
  })
};

// Display book create form on GET
exports.book_create_get = function(req, res, next) {
  res.send("NOT IMPLEMENTED: Book create GET");
};

// Handle book create on POST
exports.book_create_post = function(req, res, next) {
  res.send("NOT IMPLEMENTED: Book create POST");
};

// Display Book delete form on GET
exports.book_delete_get = function(req, res, next) {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST
exports.book_delete_post = function(req, res, next) {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET
exports.book_update_get = function(req, res, next) {
  res.send("NOT IMPLEMENTED: Book update GET");
};

// Handle book update on POST
exports.book_update_post = function(req, res, next) {
  res.send("NOT IMPLEMENTED: Book update POST");
};
