exports.default = {
  validate: function (api) {
    return {
      global: {
      	'uuid-plugin-example' : {
      		isUUID : 4
      	}
      }
    }
  }
};