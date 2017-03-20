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
  // GET all authors and genres, which we can use for adding our book
  async.parallel({
    authors: function(callback) {
      Author.find(callback);
    },
    genres: function(callback) {
      Genre.find(callback);
    },
  }, function(err, results) {
    if(err) {
      return next(err);
    } //Success so render
    res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres });
  })
};

// Handle book create on POST
exports.book_create_post = function(req, res, next) {


  // Validate and Sanitize
  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre.split(',')
  });
  console.log('BOOK: ' + book);

  var errors = req.validationErrors();
  if(errors) {
    // if errors we need to rerender book
    //GET all authors and genres for form
    async.parallel({
      // async.parallel first arg object
      authors: function(callback) {
        Author.find(callback);
      },
      genres: function(callback) {
        Genre.find(callback);
      },
    },
    // async.parallel second arg
    function(err, results) {
      if(err) {
        return next(err);
      }
      //mark selected genres as checked
      for(var i = 0; i < results.genres.length; i++) {
        if(book.genre.indexOf(results.genres[i]._id) > -1) {
          // Current genre is selected. set checked flag
          results.genres[i].checked='true';
        }
      }
      res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors});
    });
  } else {
    // data on form is valid, save book
    book.save(function(err) {
      if(err) {
        return next(err);
      }// Successful so redirect to new book record
      res.redirect(book.url);
      });

  }

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
  // Sanitize
  /* controller gets id of book to be updated from req.params.id. With async.parallel
    get specified book record populating the genre and author fields and lists all Author and Genre
    object. When completed it marks the currently selected genres as checked and the */
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Get book, authors and genres for form
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    authors: function(callback) {
      Author.find(callback);
    },
    genres: function(callback) {
      Genre.find(callback);
    },
  }, function(err, results) {
    if(err) {
      return next(err);
    }
    // Mark our selected genres as checked
    for(var allGenres = 0; allGenres < results.genres.length; allGenres++) {
      //console.log(allGenres);
      for(var bookGenres = 0; bookGenres < results.book.genre.length; bookGenres++) {
       // console.log(bookGenres);
        if(results.genres[allGenres]._id.toString() === results.book.genre[bookGenres]._id.toString()) {
          results.genres[allGenres].checked='true';
        }
      }
    }
    res.render('book_form', {title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book})
  });
};

// Handle book update on POST
exports.book_update_post = function(req, res, next) {
  /*We validate and sanitize the book data from the form and use it to create a new
    Book object(setting its _id value to the id of the object to create) If there are errors
    when we validate we re-render the form additionally displaying data entered by the user,
    the errors, and lists of genres and authors. No errors -- call Book.findByIdAAndUpdate()
    to update the Book document and the resiresct to its book detail page
  */


  // Sanitize id passed in
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  // Check other data
  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty.').notEmpty();
  req.checkBody('summary', 'Summary must not be empty.').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty.').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre.split(','),
      _id: req.params.id // This is required or a new id will be assigned
  });

  var errors = req.validationErrors();
  if(errors) {
    // Re-render book with error information, get all authors and genres for form
    async.parallel({
      authors: function(callback) {
        Author.find(calback);
      },
      genres: function(callback) {
        Genre.find(callback);
      },
    }, function(err, results) {
      if(err) {
        return next(err);
      } // Mark selected genres as checked
      for(var i = 0; i < results.genres.length; i++) {
        if(book.genre.indexOf(results.genres[i]._id) > -1) {
          results.genres[i].checked='true';
        }
      }
      results.render('book_form', {title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors});
    });
  } else {
    // Data from form is valid. Update the record
    Book.findByIdAndUpdate(req.params.id, book, {}, function(err, book) {
      if(err) {
        return next(err);
      }// Success so redirect to book detail page
      res.redirect(book.url);
    });
  }
};
