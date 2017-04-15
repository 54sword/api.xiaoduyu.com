var log4js = require('log4js');

var config = require('../../config');

module.exports = function(app) {

  if (config.debug) return

  var appenders = [];

  appenders.push({ type: "console" });
  appenders.push({
    type: "dateFile",
    filename: "logs/access.log",
    pattern: "_yyyy-MM-dd",
    alwaysIncludePattern: false,
    category: "normal"
  });

  log4js.configure({
    appenders: appenders,
    replaceConsole: true,
    levels: {
      dateFileLog: "INFO"
    }
  });

  var _logger = log4js.getLogger('normal');

  app.use(log4js.connectLogger(_logger, {level:log4js.levels.INFO}));

}
