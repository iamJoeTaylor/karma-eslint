(function (){
  'use strict';

  var chalk = require('chalk');
  var CLIEngine = require("eslint").CLIEngine;
  var cli = new CLIEngine({});

  var ESLintReporter = function(loggerFactory, config) {
    var eslintPreprocessorConfig = config.eslint;
    var log = loggerFactory.create('preprocessor.eslint');
    var options = {
      stopOnError: getOptionWithFallback('stopOnError', true),
      stopOnWarning: getOptionWithFallback('stopOnWarning', false)
    };

    chalk.enabled = config.colors !== false;

    function getOptionWithFallback(option, fallback) {
      if(typeof eslintPreprocessorConfig[option] !== 'undefined') {
        return eslintPreprocessorConfig[option];
      } else {
        return fallback;
      }
    }

    function processErrors(results) {
      var getError = function(message) {
        var rule = (message.ruleId) ?
          ' Rule: ' + message.ruleId :
          '';

        return chalk.yellow('   - ' + message.line + ':' + message.column + ' ' + message.message) +
               chalk.green(rule);
      };

      results.forEach(function(result) {
        if(result.errorCount === 1) {
          log.error('\n' +
            chalk.red(result.filePath) + '\n' +
            getError(result.messages[0]) + '\n\n'
          );
        } else if(result.errorCount > 0) {
          var errors = [];
          result.messages.forEach(function(message) {
            errors.push(getError(message));
          });
          log.error('\n' +
            chalk.red(result.errorCount + ' errors in ' + result.filePath) + '\n' +
            errors.join('\n') + '\n\n'
          );
        }
      });
    }

    function shouldStop(report) {
      if(report.errorCount || report.warningCount) processErrors(report.results);
      return (report.errorCount && options.stopOnError) ||
        (report.warningCount && options.stopOnWarning);
    }

    return function(content, file, done) {
      var report = cli.executeOnFiles([file.path]);

      log.debug('Processing "%s".', file.originalPath);
      if(shouldStop(report)) {
        done(report.results);
      } else {
        done(null, content);
      }
    };
  };

  ESLintReporter.$inject = ['logger', 'config'];

  module.exports = {
    'preprocessor:eslint': ['factory', ESLintReporter]
  };
}).call(this);
