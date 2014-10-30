var Validator = require('validator');

Validator.notNull = function (val) {
  return [null, undefined].indexOf(val) === -1
}

Validator.extend('notEmpty', function(str) {
  return !str.match(/^[\s\t\r\n]*$/);
})

Validator.extend('len', function(str, min, max) {
  return this.isLength(str, min, max)
})

Validator.extend('isUrl', function(str) {
  return this.isURL(str)
})

Validator.extend('isIPv6', function(str) {
  return this.isIP(str, 6)
})

Validator.extend('isIPv4', function(str) {
  return this.isIP(str, 4)
})

Validator.extend('notIn', function(str, values) {
  return !this.isIn(str, values)
})

Validator.extend('regex', function(str, pattern, modifiers) {
  str += '';
  if (Object.prototype.toString.call(pattern).slice(8, -1) !== 'RegExp') {
    pattern = new RegExp(pattern, modifiers);
  }
  return str.match(pattern);
})

Validator.extend('notRegex', function(str, pattern, modifiers) {
  return !this.regex(str, pattern, modifiers);
})

Validator.extend('isDecimal', function(str) {
  return str !== '' && str.match(/^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/);
})

Validator.extend('min', function(str, val) {
  var number = parseFloat(str);
  return isNaN(number) || number >= val;
})

Validator.extend('max', function(str, val) {
  var number = parseFloat(str);
  return isNaN(number) || number <= val;
})

Validator.extend('not', function(str, pattern, modifiers) {
  return this.notRegex(str, pattern, modifiers);
})

Validator.extend('contains', function(str, elem) {
  return str.indexOf(elem) >= 0 && !!elem;
})

Validator.extend('notContains', function(str, elem) {
  return !this.contains(str, elem);
})

Validator.extend('is', function(str, pattern, modifiers) {
  return this.regex(str, pattern, modifiers);
})

var ah_validator_plugin = function(api, next){
  var _ = require('underscore');
  
  var cfg = api.config.validate;

  var basicValidationFuncs = ['isEmail', 'isURL', 'isIP', 'isIPv4', 'isIPv6', 'isAlpha', 'isNumeric', 'isAlphanumeric', 'isBase64', 'isHexadecimal', 
    'isHexColor', 'isLowercase', 'isUppercase', 'isInt', 'isFloat', 'isDecimal', 'isNull', 'notNull', 'notEmpty', 'isDate', 'isCreditCard',
    'isJSON', 'isMultibyte', 'isAscii', 'isFullWidth', 'isHalfWidth', 'isVariableWidth', 'isSurrogatePair', 'isMongoId'
  ];

  var advValidationFuncs = ['is', 'not', 'equals', 'contains', 'notIn', 'isIn', 'len', 'isUUID', 'isAfter', 'isBefore', 'max', 'min'];

  var setGlobalValidators = function(action, validation){
    var params = _.union(api.params.globalSafeParams, action.inputs.required, action.inputs.optional);
    action.validate = _.extend(_.pick(cfg.global, params), action.validate);
  }

  var checkValidators = function(action){
    _.each(action.validate, function(validations, param){
      _.each(validations, function(validationParams, validationFunc){

        if(_.isUndefined(validationParams.args)){
          p = validationParams;
        }else{
          p = validationParams.args;
        }

        if(!_.contains(basicValidationFuncs, validationFunc) && !_.contains(advValidationFuncs, validationFunc)){
          api.log('ERROR - validation function ' + validationFunc + ' does not exist in the validator function set', 'error');
        }else if(_.contains(basicValidationFuncs, validationFunc) && !_.isBoolean(p)){
          api.log('valdation function ' + validationFunc + ' only accepts a boolean value as an argument', 'error');
        }else if(_.contains(advValidationFuncs, validationFunc) && _.isBoolean(p)){ // todo - this does not provide acceptable coverage in its current iteration
          api.log('valdation function ' + validationFunc + ' does not have a fully defined argument. See docs for validation argument definitions', 'error'); 
        }
      })
    })
  }

  var init = function(){
    _.each(api.actions.actions, function(actionVersions){
      _.each(actionVersions, function(action){
        if(_.isUndefined(action.validate)){
          action.validate = {};
        }
        setGlobalValidators(action);
        checkValidators(action);
      })
    })

    api.actions.addPreProcessor(function(connection, actionTemplate, next){
      var failedValidations = [];
      _.each(_.pick(actionTemplate.validate, _.keys(connection.params)), function(paramValidators, paramName){
        _.each(paramValidators, function(validationParams, validationFunc){          
          var check = true;

          if(_.isUndefined(validationParams.args)){
            p = validationParams;
          }else{
            p = validationParams.args;
          }

          if(_.contains(basicValidationFuncs, validationFunc) && !p){
            check = false;
          }
          
          if(!Array.isArray(p)){
            pArray = [];
            pArray.push(false);
          }

          pArray = _.union(p, [null, null]);

          if(!Validator[validationFunc](connection.params[paramName], pArray[0], pArray[1]) === check){
            var msg = 'parameter "' + paramName + '"failed validation ' + validationFunc + ' = ' + validationParams;
            if(!_.isUndefined(validationParams.msg)){
              var msg = validationParams.msg;
            }
            failedValidations.push({
              validationParams : p,
              validationFunc : validationFunc,
              msg : msg
            })
          }
        })
      })

      if(failedValidations.length){
        connection.error = failedValidations[0].msg;
      }

      next(connection, true);

    })

  };

  init();
  next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.ah_validator_plugin = ah_validator_plugin;