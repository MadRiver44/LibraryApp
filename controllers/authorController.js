/*
first we require the Author Model in order to access and update  the data
then we export  the functions for each of the URLs that we wish to handle
*/

var Author = require('../models/author');
var Book = require('../models/book');
var async = require('async');
var debug = require('debug')('author'); // author prefix will be displayed for all logs on this object

// Display list of all authors
exports.author_list = function(req, res, next) {
  Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors) {
      // err results are the args
      if (err) {
        return next(err);
      } // Successful so render
      /*
      console.log(list_authors); -- our results, list_authors is an object that we iterate
      over in view author_list
      */
      res.render('author_list', { title: 'Author List', author_list: list_authors });
    });
};

// Display detail page for a specific Author
exports.author_detail = function(req, res, next) {
  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books: function(callback) {
        Book.find({ author: req.params.id }, 'title summary').exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      } //Successful so render
      res.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.authors_books,
      });
    },
  );
};

// Display Author create form on Get
exports.author_create_get = function(req, res, next) {
  res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST
exports.author_create_post = function(req, res, next) {
  req.checkBody('first_name', 'First name must be specified.').notEmpty(); //alphanumeric not enforced, people may have spaces
  req.checkBody('family_name', 'Family name nust be specified.').notEmpty();
  req.checkBody('family_name', 'Family name must be alphanumerci text.').isAlphanumeric();
  /* optional() is a susbsequent validation only if the field has been entered
     i.e. we check that the optional dob is a date. checkFalsy flag means that we'll
    accept either an empty string or null as an empty value
 */
  req
    .checkBody('date_of_birth', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8061();
  req
    .checkBody('date_of_death', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8061();

  req.sanitize('first_name').escape();
  req.sanitize('family_name').escape();
  req.sanitize('first_name').trim();
  req.sanitize('family_name').trim();
  /* parameters are recieved from the request as strings. we can use toDate() OR
     toBoolean() to cast these as proper javascript types
  */
  var errors = req.validationErrors();
  req.sanitize('date_of_birth').toDate();
  req.sanitize('date_of_death').toDate();

  // All good? create a new Author instance
  var author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
  });
  // handle errors
  if (errors) {
    res.render('author_form', { title: 'Create Author', author: author, errors: errors });
    return;
  } else {
    // data on the form is valid
    author.save(function(err) {
      if (err) {
        return next(err);
      } // Successful, so redirect to new author record.( virtual )
      res.redirect(author.url);
    });
  }
};

// Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {
  /*this gets the id of the author from the url. Then the aync.parallel mesthod
    gets the author record and all associated books in parallel. When both operations
    are complete we get the author delete view passing in variables for title, author
    author books
  */
  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books: function(callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      } // Successful so render
      res.render('author_delete', {
        title: 'Delete Author',
        author: results.author,
        author_books: results.authors_books,
      });
    },
  );
};

// Handle Author delete on POST
exports.author_delete_post = function(req, res, next) {
  /*Validate that the author id is provided by via boday parameters rather than url.
    Then we get the author and their associated books in the same way as GET route.
    No books, then we delete the author object and redirect to a list of all authors.
    Books left, re-render the form passing tin the author and list of books
  */
  req.checkBody('authorid', 'Author id must exist').notEmpty();

  async.parallel(
    {
      author: function(callback) {
        Author.findById(req.params.authorid).exec(callback);
      },
      authors_books: function(callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      } // Success so render
      if (results.authors_books.length > 0) {
        // Author has books so render in the same way as GET route
        res.render('author_delete', {
          title: 'Delete Author',
          author: results.author,
          author_books: results.authors_books,
        });
      } else {
        // Author has no books. Delete object and redirect to the list
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) {
            return next(err);
          } // Success got author list
          res.redirect('/catalog/authors');
        });
      }
    },
  );
};

// Display Author update form on GET
exports.author_update_get = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  Author.findById(req.params.id, function(err, the_author) {
    if (err) {
      return next(err);
    } // Success so render
    res.render('author_form', { title: 'Update Author', author: the_author });
  });
};

// Handle Author update on POST
exports.author_update_post = function(req, res, next) {
  req.checkBody('first_name', 'First name must be specified.').notEmpty();
  req.checkBody('family_name', 'Family name must be specified.').notEmpty();
  req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlphanumeric();
  req
    .checkBody('date_of_birth', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8061();
  req
    .checkBody('date_of_death', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8061();
  req.sanitize('first_name').escape();
  req.sanitize('family_name').escape();
  req.sanitize('id').escape();
  req.sanitize('id').trim();
  req.sanitize('first_name').trim();
  req.sanitize('family_name').trim();

  // Run the validators
  var errors = req.validationErrors();
  req.sanitize('date_of_birth').toDate();
  req.sanitize('date_of_death').toDate();

  // Create a new author onject with escaped and trimmed data and the old id
  var author = new Author({
    first_name: req.body.first_name,
    family_name: req.body.family_name,
    date_of_birth: req.body.date_of_birth,
    date_of_death: req.body.date_of_death,
    _id: req.params.id,
  });
  if (errors) {
    // if there are errors, ender the form again, passing in the previously entered values and errors
    res.render('author_form', { title: 'Update Author', author: author, errors: errors });
    return;
  } else {
    // data from form is valid, update the record
    Author.findByIdAndUpdate(req.params.id, author, {}, function(err, the_author) {
      if (err) {
        return next(err);
      } // Success so render
      res.redirect(the_author.url);
    });
  }
};
