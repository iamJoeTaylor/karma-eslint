karma-eslint
------------

Installation
============

```bash
npm install karma-eslint --save-dev
```

Usage
=====

In your `karma.conf.js` file:

```javascript
  preprocessors: {
    '**/*.js': ['eslint']
  }
```

### Options

Karma-eslint accepts these options:

> `stopOnError`
> - fails a test on any error *default: `true`*


> `stopOnWarning`
> - fails a test on any Warning *default: `false`*

Example:

```javascript
  eslint: {
    stopOnError: false,
    stopOnWarning: true
  }
```

### ESLint

This plugin leverages ESLints normal [configuration methods][eslint config]. The
full list of ESLint [rules are here][eslint rules].

----

For more information on Karma [visit the Karma site][karma].


[eslint config]: http://eslint.org/docs/user-guide/configuring
[eslint rules]: http://eslint.org/docs/rules/
[karma]: http://karma-runner.github.com
