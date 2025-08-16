import { dbConnection} from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';

export const VerifyTitle = async (title) => {
    if (title.length<1||title.length>120)
    {
        throw new Error(`The title length must be between 1 and 120 characters. Currently, it is ${title.length} characters.`);
    }
    let validCharRegex=/^[\p{L}\p{N}\s\-–—:：()（）,，·'’"”]+$/u;
    if(!validCharRegex.test(title))
    {
        throw new Error("The title contains special characters that are not allowed.");
    }
    let invalidStartEndRegex=/^[\s\-–—:：]|[ \-–—:：]$/;
    if (invalidStartEndRegex.test(title))
    {
        throw new Error("Title should not start or end with spaces, dashes or colons.");
    }
    return title;
};

export const VerifyAuthor = async (Author) => {
    if (Author.length<1||Author.length>80)
    {
        throw new Error(`The Author length must be between 1 and 120 characters. Currently, it is ${Author.length} characters.`);
    }
    let validCharRegex=/^[\p{L}\p{N}\s.\-]+$/u;
    if (!validCharRegex.test(Author))
    {
        throw new Error("The author's name contains prohibited special characters. Only English, numbers, spaces, hyphens and periods are supported.");
    }
    return Author;
};


export const VerifyIntroduction= async (introduction) => {
    var wordCount=0;
    var inWord=false;
    for(var i=0;i<introduction.length;i++)
    {
        var char=introduction.charAt(i);
        if(char.trim()==='')
        {
            inWord=false;
        } 
        else
        {
            if(!inWord)
            {
                wordCount++;
                inWord=true;
                if(wordCount>255)
                {
                    break;
                }
            }
        }
    }
    if (wordCount>255)
    {
        throw new Error("The content introduction should not exceed 255 words. Currently, it is "+ wordCount +" words.");
    }
    return introduction;
};


export const Verifypublication_date = async (publication_date)=>{
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(publication_date)) {
        throw new Error('The date format is incorrect. Use YYYY-MM-DD.');
    }

    const [yearStr, monthStr, dayStr] = publication_date.split('-');
    const year  = Number(yearStr);
    const month = Number(monthStr);
    const day   = Number(dayStr);

    if ( year > maxYear) {
        throw new Error(`The year must be between 1900 and ${maxYear}.`);
    }
    if (month < 1 || month > 12) {
        throw new Error('The month must be between 1 and 12.');
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        daysInMonth[1] = 29;
    }
    if (day < 1 || day > daysInMonth[month - 1]) {
        throw new Error(`Date ${publication_date} is invalid.`);
    }

    return publication_date;
};


export const VerifyISBN = async (ISBN)=>{
    var cleanISBN=""
    for(var i=0;i<ISBN.length;i++)
    {
        var c=ISBN.charAt(i);
        if (c!=='-'&&c!==' ')
        {
            cleanISBN+=c;
        }
    }
    if(cleanISBN.length!==10&&cleanISBN.length!==13)
    {
        throw new Error("The length of the ISBN is incorrect. It should be 10 or 13.")
    }
    if(cleanISBN.length===10)
    {
        for(var i=0;i<9;i++)
        {   
            if(isNaN(cleanISBN[i]))
            {
                throw new Error("The first nine digits of the ISBN-10 must be numbers.")
            }
        }
        var lastChar=cleanISBN.charAt(9);
        if(isNaN(lastChar)&&lastChar!=='X'&&lastChar!=='x')
        {
            throw new Error("The tenth digits of the ISBN-10 must be numbers or X.")
        }
         var sum=0;
        for(var i=0;i<=9;i++)
        {   
            var value=0;
            if(i===9&&(cleanISBN[i]==='X'||cleanISBN[i]==='x'))
            {
                value=10;
            }
            else
            {
                value=parseInt(cleanISBN);
            }
            sum+=value*(i+1);
        }
        if(sum%11!==0)
        {
            throw new Error("The ISBN-10 verification is incorrect.")
        }
        return ISBN;
    }
    if(cleanISBN.length===13)
    {
        for(var i=0;i<13;i++)
        {   
            if(isNaN(cleanISBN[i]))
            {
                throw new Error("The first nine digits of the ISBN-13 must be numbers.")
            }
        }
       
        return ISBN;
    }
    var sum=0;
    for(var i=0;i<12;i++) 
    {
        var value=parseInt(cleanISBN[i], 10);
        if (i%2===0)
        {
            sum+=value*1;
        }
        else
        {
            sum+=value*3;
        }
    }
    var checkDigit=(10-(sum%10))%10;
    if(checkDigit!==parseInt(cleanISBN[12],10)) 
    {
        throw new Error("The ISBN-13 check sum is incorrect.");
    }
    return ISBN;
}


export const Verifygenres = async (genres)=>{
    if(!Array.isArray(genres)||genres.length===0)
    {
        throw new Error("The genres must be an array with at least one element.");
    }
    for(let i=0;i<genres.length;i++)
    {
        let cleanGenres="";
        let singleGeners=genres[i];
        for (let j=0;j<singleGeners.length;j++) 
        {
        let char=singleGeners[j];
            if (char!==' ') 
            {
                cleanGenres+=char;
            }
        }
        if(typeof cleanGenres!=='string')
        {  
            throw new Error("Each genre must be a string.");
        }
        let singleGenersTrim=cleanGenres.trim();
        if(cleanGenres==="")
        {
            throw new Error("Each genre must be non-empty.");
        }
        if(cleanGenres.length<5)
        {
            throw new Error("Each genre must have at least 5 characters.");
        }
        for(let i=0;i<cleanGenres.length;i++) 
        {
        let Char=cleanGenres.charCodeAt(i);
        if(!(Char>=65&&Char<=90)&&!(Char>=97&&Char<=122)) 
        {
            throw new Error('The geners field can only contain letters.');
        }
        }
    }
    return genres;
}

export const VerifyAuthorName = async (name) => {
    if (name.length < 1 || name.length > 80) {
        throw new Error(`The author's name length must be between 1 and 80 characters, currently ${name.length} characters`);
    }
    const validCharRegex = /^[\p{L}\p{N}\s.\-]+$/u;
    if (!validCharRegex.test(name)) {
        throw new Error('The author\'s name contains disallowed special characters, only letters, numbers, spaces, hyphens and periods are supported');
    }
    return name;
};

export const VerifyBirthDate = async (birthDate) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthDate)) {
        throw new Error('The birth date format is incorrect, it should be YYYY-MM-DD');
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        throw new Error(`The birth date ${birthDate} is invalid`);
    }
    if (date > new Date()) {
        throw new Error('The birth date cannot be later than the current date');
    }
    return birthDate;
};

export const VerifyDeathDate = async (deathDate, birthDate) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(deathDate)) {
        throw new Error('The death date format is incorrect, it should be YYYY-MM-DD');
    }

    const death = new Date(deathDate.split('-').map(Number));
    const birth = new Date(birthDate.split('-').map(Number));
    
    if (death < birth) {
        throw new Error('The death date cannot be earlier than the birth date');
    }
    if (death > new Date()) {
        throw new Error('The death date cannot be later than the current date');
    }
    return deathDate;
};

export const VerifyNationality = async (nationality) => {
    if (nationality.length < 1 || nationality.length > 50) {
        throw new Error(`The nationality length must be between 1 and 50 characters, currently ${nationality.length} characters`);
    }
    const validCharRegex = /^[\p{L}\s\-]+$/u;
    if (!validCharRegex.test(nationality)) {
        throw new Error('Nationality contains disallowed special characters, only letters, spaces and hyphens are supported');
    }
    return nationality;
};

export const VerifyBiography = async (biography) => {
    let wordCount = 0;
    let inWord = false;
    for (const char of biography) {
        if (char.trim() === '') {
            inWord = false;
        } else if (!inWord) {
            wordCount++;
            inWord = true;
            if (wordCount > 500) break;
        }
    }
    if (wordCount > 500) {
        throw new Error(`The biography cannot exceed 500 words, currently ${wordCount} words`);
    }
    return biography;
};

export const VerifyWorks = async (works) => {
    for (const workId of works) {
        if (typeof workId !== 'string' || workId.trim() === '' || !workId.startsWith('work-')) {
            throw new Error(`Work ID ${workId} is invalid, must be a non-empty string starting with "work-"`);
        }
    }
    return works;
};

export const VerifyAwards = async (awards) => {
    if (!Array.isArray(awards)) {
        throw new Error('The awards must be an array.');
    }
    for (const award of awards) {
        if (typeof award !== 'string' || award.trim() === '') {
            throw new Error(`Award "${award}" is invalid, must be a non-empty string`);
        }
    }
    return awards;
};


export const refreshAuthorAvg = async (authorName) => {
  const db = await dbConnection();
  const booksCol   = db.collection('books');
  const authorsCol = db.collection('authors');

  const author = await authorsCol.findOne({
    name: { $regex: `^${authorName.trim()}$`, $options: 'i' }
  });
  if (!author) return;

  const pipeline = [
    { $match: { _id: { $in: author.works.map(id => new ObjectId(id)) } } },
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ];
  const [result] = await booksCol.aggregate(pipeline).toArray();
  const avg = result ? Number(result.avg.toFixed(2)) : 0;

  await authorsCol.updateOne(
    { _id: author._id },
    { $set: { avgRating: avg } }
  );
};


export const helper = {
    VerifyAuthor,
    VerifyISBN,
    VerifyIntroduction,
    VerifyTitle,
    Verifygenres,
    Verifypublication_date,

    VerifyAuthorName,
    VerifyBirthDate,
    VerifyDeathDate,
    VerifyNationality,
    VerifyBiography,
    VerifyWorks,
    VerifyAwards,
    refreshAuthorAvg
};