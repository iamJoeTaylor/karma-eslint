(function (){
  'use strict';

  var CLIEngine = require("eslint").CLIEngine;
  var cli = new CLIEngine({});
  var _ = '\x1b[';
  var COLOR = {
      RED: _ + '91m',
      LIGHT_RED: _ + '31m',
      DARK_BLUE: _ + '34m',
      BLUE: _ + '94m',
      LIGHT_GREEN: _ + '92m',
      GREEN: _ + '32m',
      WHITE: _ + '37m',
      DARK_GREY: _ + '31m;1m',
      RESET: _ + '0m'
  };

  var ESLintReporter = function(loggerFactory, eslintPreprocessorConfig) {
    var log = loggerFactory.create('preprocessor.eslint');
    var options = {
      stopOnError: getOptionWithFallback('stopOnError', true),
      stopOnWarning: getOptionWithFallback('stopOnWarning', false)
    };

    function getOptionWithFallback(option, fallback) {
      if(typeof eslintPreprocessorConfig[option] !== 'undefined') {
        return eslintPreprocessorConfig[option];
      } else {
        return fallback;
      }
    }

    function processErrors(results) {
      var getError = function(message) {
        return '   - ' + COLOR.LIGHT_RED + message.line +
          ':' + message.column + COLOR.RESET + ' ' +
          COLOR.DARK_BLUE + message.message + COLOR.RESET;
      };

      results.forEach(function(result) {
        if(result.errorCount === 1) {
          log.error('\n' +
            COLOR.LIGHT_RED + result.filePath + '\n' + COLOR.RESET +
            getError(result.messages[0]) + '\n\n'
          );
        } else if(result.errorCount > 0) {
          var errors = [];
          result.messages.forEach(function(message) {
            errors.push(getError(message));
          });
          log.error('\n' +
            COLOR.LIGHT_RED + result.errorCount + ' errors in ' + result.filePath + '\n' + COLOR.RESET +
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

  ESLintReporter.$inject = ['logger', 'config.eslint'];

  module.exports = {
    'preprocessor:eslint': ['factory', ESLintReporter]
  };
}).call(this);
