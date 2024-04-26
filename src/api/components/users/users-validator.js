const joi = require('joi');

module.exports = {
  createUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joi.string().min(6).max(32).required().label('Password'),
    },
  },

  updateUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
    },
  },

  //Soal 3: Mengubah password
  changePassword: {
    body: {
      oldPassword: joi.string().required().label('Old Password'),
      newPassword: joi.string().min(6).max(32).required().label('New Password'),
      newPasswordConfirm: joi
        .string()
        .min(6)
        .max(32)
        .required()
        .valid(joi.ref('newPassword'))
        .label('New Password Confirmation')
        .messages({
          'any.only': 'New password confirmation must match new password',
        }),
    },
  },
};
