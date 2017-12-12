var Book = require('../models/book');
var async = require('async');
var Genre = require('../models/genre');

// Display list of all Genres
exports.genre_list = function(req, res, next) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_genres) {
      if (err) {
        return next(err);
      } // Successfull so render
      res.render('genre_list', { title: 'Genre List', list_genres: list_genres });
    });
};

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      } //Successful so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    },
  );
};

// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST
exports.genre_create_post = function(req, res, next) {
  // validate that the name field is not empty
  req.checkBody('name', 'Genre name required').notEmpty();

  // trim and escape the name field
  req.sanitize('name').escape();
  req.sanitize('name').trim();

  // run the Validators
  var errors = req.validationErrors();

  // create a Genre object with the escaped and trimmed data
  var genre = new Genre({ name: req.body.name });

  if (errors) {
    // if there are errors render the form again, passing the previously entered
    // values and errors
    res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors });
    return;
  } else {
    // data form is valid, check if Genre with same name already exists
    Genre.findOne({ name: req.body.name }).exec(function(err, found_genre) {
      console.log('found_genre: ' + found_genre);
      if (err) {
        return next(err);
      }
      if (found_genre) {
        // genre exists redirect to its detail page
        res.redirect(found_genre.url);
      } else {
        genre.save(function(err) {
          if (err) {
            return next(err);
          }
          // genre saved , redirect to detail page
          res.redirect(genre.url);
        });
      }
    });
  }
};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res, next) {
  // GET genre by id and list all books/ if any
  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      } //Success so render
      res.render('genre_delete', {
        title: 'Genre Delete',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    },
  );
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res, next) {
  req.checkBody('id', 'Id of genre must not be empty').notEmpty();

  async.parallel(
    {
      genre: function(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      } // Success so render
      if (results.genre_books.length > 0) {
        // if genre has books render in the same way as GET
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genre_books: results.genre_books,
        });
        return;
      } else {
        // Genre has no books, delte object and redirect to list of genres
        Genre.findByIdAndRemove(req.body.id, function deleteGenre(err) {
          // Success - get to genres list
          res.redirect('/catalog/genres');
        });
      }
    },
  );
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res, next) {
  // Check the name field is not empty
  req.checkBody('name', 'Genre name is required.').notEmpty();
  //Trim and escape the name fields
  req.sanitize('id').escape();
  req.sanitize('id').trim();
  req.sanitize('name').escape();
  req.sanitize('name').trim();

  // Run the validators
  var errors = validationErrors();
  // Create a new object eith the trimmed and escaped data and the old id
  var genre = new Genre({
    name: req.body.name,
    _id: req.params.id,
  });
  if (errors) {
    // if there are errors, render the form again passing in the previously entered values and errors
    res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors });
    return;
  } else {
    // Data from form is valid, Update the record
    Genre.findByIdAndUpdate(req.params.id, {}, function(err, the_genre) {
      if (err) {
        return next(err);
      } // Success so redirect to genre detail page
      res.reidrect(the_genre.url);
    });
  }
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res, next) {
  res.send('NOT IMPLEMENTED: genre update POST');
};
