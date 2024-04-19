// Validation
const Joi = require("@hapi/joi");

// Register Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    gender: Joi.string().valid("male", "female", "other").required(),
    password: Joi.string().min(6).required(),
    password2: Joi.ref("password"),
  });
  // .with("password", "password2");

  return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),

    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
