import {dbConnection} from '../config/mongoConnection.js';

export const VerifyFirstName = async(firstName)=>{
    if(typeof firstName!="string")
    {
        throw new Error("The FirstName must be string!")
    }
    if(firstName.trim()===""||!firstName)
    {
        throw new Error("The FirstName can't be empty!")
    }
    if(firstName.length>25||firstName.length<2)
    {
        throw new Error("The Firstname length does not meet the requirement!")
    }
    for(var i=0;i<firstName.length;i++)
    {
        if(firstName[i]>=0||firstName[i]<=9)
        {
            throw new Error("The Firstname cannot contain a number!")
        }
    }
    return firstName;
}
export const VerifyLastName = async(LastName)=>{
    if(typeof LastName!="string")
    {
        throw new Error("The LastName must be string!")
    }
    if(LastName.trim()===""||!LastName)
    {
        throw new Error("LastName can't be empty!")
    }
    if(LastName.length>25||LastName.length<2)
    {
        throw new Error("The LastName length does not meet the requirement!")
    }
    for(var i=0;i<LastName.length;i++)
    {
        if(LastName[i]>=0||LastName[i]<=9)
        {
            throw new Error("The LastName cannot contain a number!")
        }
    }

    return LastName;
}

export const VerifyUseIdForRegister = async(userId)=>{
    if(typeof userId!="string")
    {
        throw new Error("userId must be string!")
    }
    if(userId.trim()===""||!userId)
    {
        throw new Error("userId can't be empty!")
    }
    if(userId.length>10||userId.length<5)
    {
        throw new Error("The userId length does not meet the requirement!")
    }
     for(var i=0;i<userId.length;i++)
    {
        if(userId[i]>='0'&&userId[i]<='9')
        {
            throw new Error("The userId cannot contain a number!")
        }
    }
    let LowerUserId=userId.toLowerCase();
    let db=await dbConnection();
    let collection=db.collection('users');
    const ExistingUser=await collection.findOne(
    { userId:LowerUserId },
    { collation:{locale:'en', strength:2}});
    if(ExistingUser)
    {
        throw new Error("userId already exists.")
    }
    return userId;
}

export const VerifyPassport= async(password)=>{
    if(typeof password!="string")
    {
        throw new Error("password must be string!")
    }
    if(password.trim()===""||!password)
    {
        throw new Error("password can't be empty!")
    }
    if(password.length<8)
    {
        throw new Error("The password length does not meet the requirement!")
    }
    let CountNumber=0;
    let CountUpChar=0;
    let CountSpecial=0;
    for(var i=0;i<password.length;i++)
    {
        if(password[i]===" ")
        {
            throw new Error("The password contains empty space!")
        }
        else if(password[i]>='0'&&password[i]<='9')
        {
            CountNumber++;
        }
        else if(password[i]>='A'&&password[i]<'Z')
        {
            CountUpChar++;
        }
        else if(password[i]>='a'&&password[i]<='z')
        {}
        else
        {
            CountSpecial++;
        }
    }
    if(CountNumber>=1&&CountSpecial>=1&&CountUpChar>=1)
    {
        return password;
    }
    throw new Error("The password must contain at least 1 capital letter, 1 number, and 1 special character")
}



export const VerifyRole = async (role) =>{
    if (typeof role!=="string")
    {
        throw new Error("The role must be string!");
    }
    const validRoles=['admin','user'];
    const lowerCaseRole=role.toLowerCase();
    if (!validRoles.includes(lowerCaseRole))
    {
        throw new Error("The role must be either 'admin' or 'user'!");
    }
    return lowerCaseRole;
}

export const VerifyUseId = async(userId)=>{
    if(typeof userId!="string")
    {
        throw new Error("userId must be string!")
    }
    if(userId.trim()===""||!userId)
    {
        throw new Error("userId can't be empty!")
    }
    if(userId.length>10||userId.length<5)
    {
        throw new Error("The userId length does not meet the requirement!")
    }
    for(var i=0;i<userId.length;i++)
    {
        if(userId[i]>='0'&&userId[i]<='9')
        {
            throw new Error("The userId cannot contain a number!")
        }
    }
    return userId;
}

export const VerifyCity = async (city = '') => {
  if (!city || city.trim() === '') return '';
  city = city.trim();
  if (city.length < 2 || city.length > 50) throw new Error('City length must be 2-50.');
  if (!/^[A-Za-z\s-]+$/.test(city)) throw new Error('City can only contain letters, spaces and hyphens.');
  return city;
};

export const VerifyState = async (state) => {
  if (!state || state.trim() === '') return ''
  state = state.trim();
    if (state.length < 2 || state.length > 50) throw new Error('State length must be 2-50.');
  if (!/^[A-Za-z\s-]+$/.test(state)) throw new Error('State can only contain letters, spaces and hyphens.');
  return state;
};

export const VerifyEmail = async (email) => {
  if (typeof email !== 'string') throw new Error('Email must be a string.');
  email = email.trim().toLowerCase();
  if (!email) throw new Error('Email cannot be empty.');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('Invalid email format.');
  const db = await dbConnection();
  const usersCol = db.collection('users');
  const exist = await usersCol.findOne({ email }, { collation: { locale: 'en', strength: 2 } });
  if (exist) throw new Error('Email already registered.');

  const adminsCol = db.collection('admins');
  const existAdmin = await adminsCol.findOne({ email }, { collation: { locale: 'en', strength: 2 } });
  if (existAdmin) throw new Error('Email already registered by an admin.');

  return email;
};


export const userhelper = {
  VerifyFirstName,
  VerifyLastName,
  VerifyPassport,
  VerifyUseId,
  VerifyUseIdForRegister,
  VerifyRole,
  VerifyCity,
  VerifyState,
  VerifyEmail
};