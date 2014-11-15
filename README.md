ah-validator-plugin
===================
Parameter validation middleware plugin for the [actionhero.js] API server built on [Chris O'Hara]'s fantastic [validator.js] library and leaning on [Sequelize]'s model validation definition/usage and validator extensions.

Installation
------------
```sh
cd [actionhero-base-directory]
npm install ah-validator-plugin --save
```
Enable the plugin in Actionhero by adding 'ah-validator-plugin' to the plugins array in config/api.js

Usage
-----------

Validators are either defined locally in the action definitions or globally in the api.config.validation configuration object.

Each key in the object will validate the values of matching keys from the connection.params object. The validation methods and usage match the Sequelize implementation at http://sequelizejs.com/docs/1.7.8/models#validations

Local definitions override global definitions for each key.

A custom error message can also be added to a validation method by going a level deeper in the value and adding the keys 'args' and 'msg'. An example can be seen below in validate.email.notIn.

#### local example (inside an action definition)
```js
inputs: {
    required: ['email', 'username'],
    optional: [],
},
validate: {
    'username' : {
      isAlpha : true,
    },
    'email' : {
      isEmail : true,
      notIn   : {
        args : ['admin@ah.com'],
        msg : 'admin@ah.com is a reserved email. Please choose another.'
    }
},
```

#### global example (sample config/validate.js file)
```js
exports.default = {
  validate: function (api) {
    return {
      global: {
        'uuid' : {
          isUUID : 4
        }
      }
    }
  }
};
```

License
----

MIT

[Devin Despain]:https://github.com/dangerdespain
[Chris O'Hara]:https://github.com/chriso
[actionhero.js]:http://actionherojs.com/
[validator.js]:https://github.com/chriso/validator.js
[Sequelize]:http://sequelizejs.com/
