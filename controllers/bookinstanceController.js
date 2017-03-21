var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var moment = require('moment');
var async = require('async');

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
      if(err) {
        return next(err);
      }// Successful so render
      res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances });
      });
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if(err) {
        return next(err);
      }// Successful so render
      res.render('bookinstance_detail', {title: 'Book', bookinstance: bookinstance });
    })
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {
  // the controller gets a list of all the books(book_list)  and passes it to
  // the bookinstance_form.pug along with the title
  Book.find({}, 'title')
    .exec(function(err, books) {
      if(err) {
        return next(err);
      }// Successful so render
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });
};

// Handle BookInstance create on POST
exports.bookinstance_create_post = function(req, res, next) {
  // Validate and Sanitize
  req.checkBody('book', 'Book must be specified').notEmpty();// Alphanumeric is not enforced, titles may have spaces
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date').optional({checkFalsy: true}).isDate();

  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();

  // All good? create a new instance
  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back
  });

  var errors = req.validationErrors();
  if(errors) {
    Book,find({}, 'title')
      .exec(function(err, books) {
        if(err) {
          return next(err);
        }// Success so render
        res.render('bookinstance_form', {title: 'Create BookInsatance', book_list: books, selected_book: bookinstance.book._id, errors: errors, bookinstance: bookinstance});
      });
      return;
  }else {
    // data form is valid
    bookinstance.save(function(err) {
      if(err) {
        return next(err);
      }// Successful so render
      res.redirect(bookinstance.url);
    });
  }
};

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if(err) {
        return next(err);
      } // Success so render
      res.render('bookinstance_delete', {title: 'Delete BookInstance', bookinstance: bookinstance});
    });
  };

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, next) {
/*  req.checkBody('id', 'Id must not be empty.').notEmpty();
  req.sanitize('id').escape();
  req.sanitize('id').trim();
  var errors = req.validationErrors();*/

  //console.log(req.body.id);
  // BookInstance id is valid
  console.log(req.params);
  BookInstance.findByIdAndRemove(req.body.id, function deleteBookInstance(err) {
    if(err) {
      console.log('error here')
      return next(err);
    }// Success so redirect
    res.redirect('catalog/bookinstances');
  });
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res, next) {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res, next) {
  res.send("NOT IMPLEMENTED: BookInstance update on POST");
};
