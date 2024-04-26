const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { comparePassword } = require('../../../utils/password');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const passwordConfirm = request.body.password_confirm;

    //Soal 2: Konfirmasi password
    if (password !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Passwords do not match'
      );
    }

    //Soal 1: Menambahkan fungsi untuk mengecheck apakah email sudah ada yang menggunakan/belum
    const emailExists = await usersService.checkEmailExists(email); //Memanggil dari service
    if (emailExists) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email already taken'
      ); //Ini output yang akan diberikan
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

//Soal 3: Mengubah password
async function changePassword(request, response, next) {
  try {
    const userId = request.params.id;
    const { oldPassword, newPassword, newPasswordConfirm } = request.body;

    //Melakukan validasi bahwa passwordnya harus memiliki 6 s/d 32 karakter
    if (newPassword.length < 6 || newPassword.length > 32) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'New password length must be between 6 and 32 characters'
      );
    }

    //Melakukan pengecheckan bahwa password baru sama dengan password baru
    if (newPassword !== newPasswordConfirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'New passwords do not match'
      );
    }

    //Melakukan pengecheckan bahwa password lama sama dengan password saat ini
    const user = await usersService.getUser(userId);
    if (!user) {
      throw errorResponder(errorTypes.UNAUTHORIZED, 'User not found');
    }
    const passwordMatch = await comparePassword(oldPassword, user.password);
    if (!passwordMatch) {
      throw errorResponder(
        errorTypes.UNAUTHORIZED,
        'Old password does not match current password'
      );
    }

    //Melakukan pengubahan pada password
    const success = await usersService.updatePassword(userId, newPassword);
    if (!success) {
      throw errorResponder(
        errorTypes.INTERNAL_SERVER_ERROR,
        'Failed to update password'
      );
    }

    return response
      .status(200)
      .json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword, //Menambahkan fungsi soal nomor 3
};
