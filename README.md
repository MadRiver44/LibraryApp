### LibraryApp

![App Screenshot](https://user-images.githubusercontent.com/7386478/35823609-246b1c82-0a7e-11e8-8284-28dd5a00e76a.png)


### Description

A complete fullstack app with a Model-View-Controller achitecture.

### Deployment

To interact, click [HERE](https://glacial-escarpment-66257.herokuapp.com/catalog)

### Technologies used

* Node
* Express
* MongoDB
* Mongoose
* Pug
* Git
* Heroku

### Summary

This app is a very detailed and code documented exercise in model view controller achitecture. Starting with app.js, I required all dependencies, set the middleware, connect to the database, add the main routes, and finally setup an error handler.

The overall process is to create a schema which is then used to create a a model for the type of data we need to store. How do we present this info? We define the appropriate URLs to return those resources to users and the accompanying views. The __Routes__ forward the suppporting requests to the __Controller__ functions. The __Controller__ functions take the request and get the requested data from the __Models__, creating an HTML template displaying this requested data and pass it on to the __View__. The __View__ are templates used by the __Controller__ to render data.
