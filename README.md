# express-mail [![Build Status](https://secure.travis-ci.org/sorich87/express-mail.png?branch=master)](http://travis-ci.org/sorich87/express-mail)

Easy email delivery from Express apps.

- Use your favorite template engine to render the emails
- Inline the CSS with [juice2](https://github.com/andrewrk/juice)
- Send emails with [nodemailer](https://github.com/andris9/Nodemailer)

## Installation

`npm install express-mail`

## Example

```javascript
var express = require('express');
var expressMail = require('express-mail');
var app = express.createServer();

// Configure express-mail and setup default mail data.
expressMail.extend(app, {
  transport: 'SMTP',
  config: {
    service: 'Gmail',
    auth: {
      user: 'gmail.user@gmail.com',
      pass: 'userpass'
    }
  },
  defaults: {
    from: 'gmail.user@gmail.com'
  }
});

// Setup email data.
var mailOptions = {
  to: 'bar@blurdybloop.com',
  subject: 'Hello ✔',
  locals: {
    title: 'Hello',
    message: 'Welcome to my website'
  }
}

// Send email.
app.send('mail', mailOptions, function (error, response) {
  if (error) {
    console.log(error);
  } else {
    console.log('Message sent: ' + response.message);
  }
});
```

## Usage

Include the module.

`var expressMail = require('express-mail');`

Add the mail functionality to your Express app with
`expressMail.extend(app, options)`.

```
var express = require('express');
var app = express.createServer();

expressMail.extend(app, {
  transport: 'SMTP',
  config: {
    service: 'Gmail',
    auth: {
      user: 'gmail.user@gmail.com',
      pass: 'userpass'
    }
  },
  defaults: {
    from: 'gmail.user@gmail.com'
  }
});
```

- `transport` is a transport type supported by Nodemailer. See the
Nodemailer documentation for [all the
possible transport methods](https://github.com/andris9/Nodemailer#possible-transport-methods).
- `config` is the options object send to Nodemailer when creating the
  transport. See the Nodemailer documentation for [the possible options
for each transport method](https://github.com/andris9/Nodemailer#setting-up-a-transport-method).
- `defaults` defines the default properties used for all emails you
  send. They can be overwritten when calling `app.mail.send`.

To send emails, use `app.mail.send(template, options, [callback])` (or
`res.mail.send(template, options, [callback])` when sending from Express
middlewares or your app routes).

- `template` the template path in your views directory.
- `options` is an object containing the email message fields. See
  Nodemailer documentation for [the possible
fields](https://github.com/andris9/Nodemailer#e-mail-message-fields).
- `callback` will be called after running the mail function.

You can also use `res.mail.stub(template, options, [callback])` to fake
sending an email and `res.mail.reload(config)` to reload your
configuration.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## License
Copyright (c) 2014 Ulrich Sossou. Licensed under the MIT license.
