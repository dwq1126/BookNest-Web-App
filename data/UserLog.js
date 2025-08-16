import { userhelper } from './UserHelper.js';
import { dbConnection } from '../config/mongoConnection.js';
import bcrypt from 'bcrypt';

const signUpUser = async (
  firstName,
  lastName,
  userId,
  password,
  email,
  profilePicture = '/static/profile/default.jpg',
  city = '',
  state = '',
  age = '',
  role
) => {
  const validFirstName = await userhelper.VerifyFirstName(firstName);
  const validLastName = await userhelper.VerifyLastName(lastName);
  const validUserId = await userhelper.VerifyUseIdForRegister(userId);
  const validPassword = await userhelper.VerifyPassport(password);
  const validEmail = await userhelper.VerifyEmail(email);
  const validCity = await userhelper.VerifyCity(city);
  const validState = await userhelper.VerifyState(state);

  if (age !== '') {
    if (!/^\d{1,2}$/.test(age) || Number(age) < 13 || Number(age) > 120) {
      throw new Error('Age must be a number between 13 and 120.');
    }
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(validPassword, saltRounds);

  let reviewIds = [];
  let commentIds = [];
  let db = await dbConnection();
  let newUser = {
    firstName: validFirstName,
    lastName: validLastName,
    userId: validUserId,
    hashedPassword: hashedPassword,
    email: validEmail,
    profilePicture: profilePicture,
    city: validCity,
    state: validState,
    age: age,
    role: role,
    reviewIds: reviewIds,
    commentIds: commentIds
  };

  let result = await db.collection('users').insertOne(newUser);
  if (result.acknowledged && result.insertedId) {
    return true;
  } else {
    throw new Error("failed.");
  }
  return { registrationCompleted: true };
};

const signInUser = async (userId, password) => {
  if (typeof userId === 'undefined') throw new Error('userId must be provided.');
  if (typeof password === 'undefined') throw new Error('password must be provided.');

  const validUserId = await userhelper.VerifyUseId(userId);
  const validPassword = await userhelper.VerifyPassport(password);

  const db = await dbConnection();
  const user = await db.collection('users').findOne({ userId: validUserId });
  
  if (!user) throw new Error('Either userId or password is invalid.');

  const isMatch = await bcrypt.compare(validPassword, user.hashedPassword);
  
  if (!isMatch) throw new Error('Either userId or password is invalid.');
 
  return {
    _id: user._id.toString(),
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role || 'user'
  };
};

const UserFunctions = {
  signUpUser,
  signInUser
};

export default UserFunctions;