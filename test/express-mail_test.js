'use strict';

var nodemailer = require('nodemailer');
var expressMail = require('../lib/express-mail.js');

exports.expressMail = {
  setUp: function (done) {
    var app, res, transports;

    this._createTransport = nodemailer.createTransport;

    this.transports = transports = {
      'SMTP': {name: 'SMTP'},
      'STUB': {name: 'STUB'}
    };

    nodemailer.createTransport = function (name, config) {
      transports[name].config = config;
      return transports[name];
    };

    this.app = app = {
      get: function (setting) {
        switch(setting) {
          case 'view engine':
            return 'views';
          case 'views':
            return 'path/to/views';
        }
      },
      render: function () {
        arguments[2](null, '<style>body{color: #fff}</style><body>test</body>');
      },
      use: function (cb) {
        cb({app: app}, res, function () {});
      }
    };

    this.res = res = {
      render: function () {}
    };

    done();
  },

  tearDown: function (done) {
    nodemailer.createTransport = this._createTransport;
    done();
  },

  'extends an Express app': function (test) {
    test.expect(3);

    this.app.use(expressMail({transport: 'SMTP'}));

    test.ok(this.app.mail.reload);
    test.ok(this.app.mail.send);
    test.ok(this.app.mail.stub);
    test.done();
  },

  'extends an Express response object': function (test) {
    test.expect(3);

    this.app.use(expressMail({transport: 'SMTP'}));

    test.ok(this.res.mail.reload);
    test.ok(this.res.mail.send);
    test.ok(this.res.mail.stub);
    test.done();
  },

  'creates a transport': function (test) {
    test.expect(4);

    var calls = [];

    nodemailer.createTransport = function () {
      calls.push(arguments);
    };

    this.app.use(expressMail({
      config: 'config',
      transport: 'SMTP'
    }));

    test.equal(calls[0][0], 'STUB');
    test.equal(calls[0][1], 'config');
    test.equal(calls[1][0], 'SMTP');
    test.equal(calls[1][1], 'config');
    test.done();
  },

  'send()': {
    'renders the template': function (test) {
      test.expect(2);

      var call;

      this.app.render = function () {
        call = arguments;
      };

      this.app.use(expressMail({transport: 'SMTP'}));
      this.app.mail.send('template', {locals: 'locals'});

      test.equal(call[0], 'template');
      test.equal(call[1], 'locals');
      test.done();
    },

    'sends the email with the correct transport': function (test) {
      test.expect(2);

      var call;

      this.transports['SMTP'].sendMail = function () {
        call = arguments;
      };

      this.app.use(expressMail({transport: 'SMTP'}));
      this.app.mail.send('template', {locals: 'locals'}, 'cb');

      test.equal(call[0].html, '<html><body style="color: #fff;">test</body>\n</html>');
      test.equal(call[1], 'cb');
      test.done();
    }
  },

  'stub()': {
    'sends the email with the stub transport': function (test) {
      test.expect(2);

      var call;

      this.transports['STUB'].sendMail = function () {
        call = arguments;
      };

      this.app.use(expressMail({transport: 'SMTP'}));
      this.app.mail.stub('template', {locals: 'locals'}, 'cb');

      test.equal(call[0].html, '<html><body style="color: #fff;">test</body>\n</html>');
      test.equal(call[1], 'cb');
      test.done();
    }
  },

  'reload()': {
    setUp: function (done) {
      var transport;

      this.transport = transport = {};

      nodemailer.createTransport = function () {
        return transport;
      };

      this.app.use(expressMail({transport: 'SMTP'}));

      done();
    },

    'closes the transport': function (test) {
      test.expect(1);
      this.transport.close = test.ok;
      this.app.mail.reload({});
      test.done();
    },

    'creates a new transport instance': function (test) {
      test.expect(1);

      var newTransport = false;

      this.transport.close = function (cb) {
        cb();
      };

      nodemailer.createTransport = function () {
        return {
          close: function () {
            newTransport = true;
          }
        };
      };

      this.app.mail.reload({});
      this.app.mail.reload({}); // Second call runs the new transport.close

      test.ok(newTransport);
      test.done();
    }
  }
};
