/*
 * express-mail
 * http://github.com/sorich87/express-mail
 *
 * Copyright (c) 2014 Ulrich Sossou
 * Licensed under the MIT license.
 */
var juice = require('juice2');
var nodemailer = require('nodemailer');
var path = require('path');

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Merge all properties of a source object into a destination object.
 *
 * @param {Object} dest
 * @param {Object} source
 * @return {dest}
 * @api private
 */
function merge(dest, source) {
  if (dest && source) {
    for (var prop in source) {
      dest[prop] = source[prop];
    }
  }
  return dest;
}

/**
 * Return a function that will send an email with a specific transport.
 *
 * @param {nodemailer.Transport} transport
 * @param {Function} render
 * @param {Object} defaults
 * @api private
 */
function sendFactory(transport, render, root, ext, defaults) {
  return function (template, options, cb) {
    options = merge(options, defaults);

    render(template, options.locals, function (err, html) {
      if (err) {
        return cb(err);
      }

      if (template.indexOf('.') === -1) {
        template += ext;
      }

      var url = 'file://' + path.join(root, template);

      juice.juiceContent(html, {url: url}, function (err, html) {
        if (err) {
          return cb(err);
        }

        options.html = html;
        transport.sendMail(options, cb);
      });
    });
  };
}

/**
 * Add mail functions to `app` and `res`.
 *
 * @param {express.HTTPServer} app
 * @param {Object} options
 * @return {app} for chaining
 * @api public
 */
function extend(options) {
  var defaults = {
    generateTextFromHTML: true
  };
  var stub = nodemailer.createTransport('STUB', options.config);
  var transport = nodemailer.createTransport(options.transport, options.config);

  defaults = merge(defaults, options.defaults);

  function reload(options, cb) {
    transport.close(function (err) {
      if (err) {
        if (cb) {
          cb(err);
        }
        return;
      }

      defaults = merge({}, options.defaults);
      transport = nodemailer.createTransport(options.transport, options.config);

      if (cb) {
        cb();
      }
    });
  }

  return function (req, res, next) {
    var app = req.app;
    var ext = app.get('view engine');
    var root = app.get('views');

    if (ext[0] !== '.') {
      ext = '.' + ext;
    }

    app.mail = {
      reload: reload,
      send: sendFactory(transport, app.render.bind(app), root, ext, defaults),
      stub: sendFactory(stub, app.render.bind(app), root, ext, defaults)
    };

    res.mail = {
      reload: reload,
      send: sendFactory(transport, res.render.bind(res), root, ext, defaults),
      stub: sendFactory(stub, res.render.bind(res), root, ext, defaults)
    };
    next();
  };
}

/**
 * Expose `extend()`.
 */

module.exports = extend;
