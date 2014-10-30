exports.default = {
  validate: function (api) {
    return {
    	options: {
    		haltOnValidationFailure : true
    	},
      global: {
      	'uuid-plugin-example' : {
      		isUUID : 4
      	}
      }
    }
  }
};