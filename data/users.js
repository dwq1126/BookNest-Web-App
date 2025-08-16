// data/users.js
import User from '../models/User.js'; 
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const saltRounds = 10;
const checkString = (str, varName) => {
  if (!str) throw `Error: You must supply a ${varName}!`;
  if (typeof str !== 'string') throw `Error: ${varName} must be a string!`;
  str = str.trim();
  if (str.length === 0) throw `Error: ${varName} cannot be an empty string or string with just spaces!`;
  return str;
};

const checkId = (id, varName = 'ID') => {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== 'string') throw `Error: ${varName} must be a string`;
    id = id.trim();
    if (id.length === 0) throw `Error: ${varName} cannot be an empty string`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} is not a valid ObjectId`;
    return id;
};

// --- Exported Functions ---

/**
 * Creates a new user with a hashed password
 * @param {string} username
 * @param {string} password
 * @param {string} [avatarUrl]
 * @returns {Promise<object>} The newly created user object (without the password hash)
 */
export const createUser = async (username, password, avatarUrl) => {
  username = checkString(username, 'Username').toLowerCase();
  if (/\s/.test(username)) throw 'Username cannot contain spaces.';
  if (username.length < 3) throw 'Username must be at least 3 characters long.';

  password = checkString(password, 'Password');
  if (/\s/.test(password)) throw 'Password cannot contain spaces.';
  if (password.length < 8) throw 'Password must be at least 8 characters long.';

  const existingUser = await User.findOne({ username: username });
  if (existingUser) throw `Error: A user with the username '${username}' already exists.`;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUserInfo = {
    username,
    passwordHash,
  };
  if (avatarUrl) {
    newUserInfo.avatarUrl = checkString(avatarUrl, 'Avatar URL');
  }

  const newUser = new User(newUserInfo);
  await newUser.save();

  return {
    _id: newUser._id.toString(),
    username: newUser.username,
    avatarUrl: newUser.avatarUrl
  };
};

/**
 * Authenticates a user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} The authenticated user object (without the password hash)
 */
export const checkUser = async (username, password) => {
  username = checkString(username, 'Username').toLowerCase();
  password = checkString(password, 'Password');

  const user = await User.findOne({ username: username });
  if (!user) throw 'Authentication failed: Invalid username or password.';

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw 'Authentication failed: Invalid username or password.';

  // Return user object without the password hash
  return {
    _id: user._id.toString(),
    username: user.username,
    avatarUrl: user.avatarUrl
  };
};

/**
 * Gets a user by their ID
 * @param {string} userId 
 * @returns {Promise<object>} The user object (without the password hash)
 */
export const getUserById = async (userId) => {
    userId = checkId(userId, 'User ID');
    const user = await User.findById(userId);
    if (!user) throw 'User not found';

    // Return user object without the password hash
    return {
        _id: user._id.toString(),
        username: user.username,
        avatarUrl: user.avatarUrl
    };
};