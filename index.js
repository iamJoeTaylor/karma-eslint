(function (){
  'use strict';

  var chalk = require('chalk');
  var CLIEngine = require("eslint").CLIEngine;
  var cli = new CLIEngine({});

  var ESLintReporter = function(loggerFactory, config) {
    var eslintPreprocessorConfig = config.eslint;
    var log = loggerFactory.create('preprocessor.eslint');
    var options = {
      showWarnings: getOptionWithFallback('showWarnings', true),
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
	  if(result.errorCount > 0) {
          var errors = [];
          result.messages.forEach(function(message) {
	      if(message.severity > 1){
		  errors.push(getError(message));
	      }
          });
          log.error('\n' +
            chalk.red(result.errorCount + ' error(s) in ' + result.filePath) + '\n' +
            errors.join('\n') + '\n\n'
          );
        }
      });
    }

    function processWarnings(results) {
      var getWarning = function(message) {
        var rule = (message.ruleId) ?
          ' Rule: ' + message.ruleId :
          '';

        return chalk.yellow('   - ' + message.line + ':' + message.column + ' ' + message.message) +
               chalk.green(rule);
      };

      results.forEach(function(result) {
	  if(result.warningCount > 0) {
          var warnings = [];
          result.messages.forEach(function(message) {
	      if(message.severity === 1){
		  warnings.push(getWarning(message));
	      }
          });
          log.warn('\n' +
            chalk.yellow(result.warningCount + ' warning(s) in ' + result.filePath) + '\n' +
            warnings.join('\n') + '\n\n'
          );
        }
      });
    }

    function shouldStop(report) {
      if(report.warningCount && 
	 (options.showWarnings || options.stopOnWarning)) 
	  processWarnings(report.results);
      if(report.errorCount) processErrors(report.results);
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
