import { ObjectId } from 'mongodb';
import {helper} from './Bookhelper.js';
import {dbConnection} from '../config/mongoConnection.js';

const addAuthor = async (
    name,
    birth_date,
    death_date,
    nationality,
    biography,
    works,
    awards
) => {
    if(!name||!birth_date||!nationality||!biography)
    {
        throw new Error('Name, date of birth, nationality and brief biography are mandatory fields.');
    }
    if(typeof name!=='string'||typeof birth_date!=='string'|| 
        typeof nationality!=='string'||typeof biography!== 'string')
    {
        throw new Error('Name, date of birth, nationality and biography must all be in the form of strings.');
    }
    if(death_date&& typeof death_date !=='string')
    {
        throw new Error('If the date of death is provided, it must be in the form of a string.');
    }
    if(name.trim()===''||birth_date.trim()===''|| 
        nationality.trim()===''||biography.trim() ==='')
    {
        throw new Error('Name, date of birth, nationality and brief biography cannot be left blank.');
    }
    name=await helper.VerifyAuthorName(name);
    birth_date=await helper.VerifyBirthDate(birth_date);
    if (death_date) {
        death_date=await helper.VerifyDeathDate(death_date, birth_date);
    }
    nationality=await helper.VerifyNationality(nationality);
    biography=await helper.VerifyBiography(biography);
    if (works!== undefined) {
        if (!Array.isArray(works)) {
            throw new Error('The works must be an array when provided.');
        }
        works = await helper.VerifyWorks(works);
    } else {
        works = [];
    }

    if (awards !== undefined) {
        if (!Array.isArray(awards)) {
            throw new Error('The awards must be an array when provided.');
        }
        awards = await helper.VerifyAwards(awards);
    } else {
        awards = [];
    }
    const now=new Date().toISOString().split('T')[0];
    const authorData={
        name,
        birth_date,
        death_date: death_date||'',
        nationality,
        biography,
        works,
        awards,
        avgRating: 0,
        created_at:now,
        updated_at:now
    };

    const db=await dbConnection();
    const authorsCollection=db.collection('authors');
    const sameName = await authorsCollection.findOne({
        name: { $regex: '^' + name.trim() + '$', $options: 'i' }
    });

    if (sameName) {
        throw new Error('Author "' + name + '" already exists and cannot be added again.');
    }
    const result=await authorsCollection.insertOne(authorData);
    if (!result.acknowledged || !result.insertedId) {
        throw new Error('Failed to add author');
    }
    const booksCollection = db.collection('books');
    const matchedBooks = await booksCollection.find({
        author: { $regex: name.trim(), $options: 'i' }
    }).toArray();

    if (matchedBooks.length > 0) {
        const bookIds = matchedBooks.map(book => book._id.toString());
        const uniqueBookIds = [...new Set([...works, ...bookIds])];

        await authorsCollection.updateOne(
            { _id: result.insertedId },
            { 
                $set: { 
                    works: uniqueBookIds,
                    updated_at: now
                } 
            }
        );

        const updatedAuthor = await authorsCollection.findOne({ _id: result.insertedId });
        return {
            ...updatedAuthor,
            _id: updatedAuthor._id.toString(),
            message: `Author added successfully and linked to ${bookIds.length} books`
        };
    }
    const newAuthor = await authorsCollection.findOne({ _id: result.insertedId });
    return {
        ...newAuthor,
        _id: newAuthor._id.toString(),
        message: "Author added successfully, no associated books found yet"
    };
};

const findAuthor = async (name) => {
    if (!name) 
    {
        throw new Error('The name parameter must be provided.');
    }
    if (typeof name!=='string' ||name.trim()==='') {
        throw new Error('The name must be a non-empty string.');
    }
    const db = await dbConnection();
    const collection = db.collection('authors');
    const query={ name: { $regex: name.trim(), $options: 'i' } };
    const authors=await collection.find(query).toArray();

    if (authors.length===0) {
        throw new Error('The author could not be found.');
    }
    return authors.map(author => ({
        ...author,
        _id: author._id.toString()
    }));
};

const updateAuthor = async (
    authorId,
    name,
    birth_date,
    death_date,
    nationality,
    biography,
    works,
    awards
) => {
    if(!authorId||!name||!birth_date||!nationality ||!biography|| 
        works===undefined || awards===undefined)
    {
        throw new Error('All fields (including author ID, works and awards) must provide valid values.');
    }
    if(typeof authorId!=='string'||typeof name !=='string'|| 
        typeof birth_date!=='string'||typeof nationality !=='string'|| 
        typeof biography!=='string')
    {
        throw new Error("The author's ID, name, date of birth, nationality and biography must all be in the form of strings.");
    }
    if (death_date&&typeof death_date!=='string')
    {
        throw new Error('If the date of death is provided, it must be in the form of a string.');
    }
    if (!Array.isArray(works)||!Array.isArray(awards))
    {
        throw new Error('The works and awards must be in the form of an array.');
    }
    if (!ObjectId.isValid(authorId))
    {
        throw new Error('Invalid author ID format');
    }
    const objectId=new ObjectId(authorId);
    name=await helper.VerifyAuthorName(name);
    birth_date=await helper.VerifyBirthDate(birth_date);
    if (death_date)
    {
        death_date=await helper.VerifyDeathDate(death_date, birth_date);
    }
    nationality=await helper.VerifyNationality(nationality);
    biography=await helper.VerifyBiography(biography);
   if (works!== undefined) {
        if (!Array.isArray(works)) {
            throw new Error('The works must be an array when provided.');
        }
        works = await helper.VerifyWorks(works);
    } else {
        works = [];
    }

    if (awards !== undefined) {
        if (!Array.isArray(awards)) {
            throw new Error('The awards must be an array when provided.');
        }
        awards = await helper.VerifyAwards(awards);
    } else {
        awards = [];
    }
    const db=await dbConnection();
    const collection=db.collection('authors');
    const existingAuthor=await collection.findOne({ _id: objectId });
    if (!existingAuthor)
    {
        throw new Error('No author found matching the specified criteria.');
    }
    const updateData={
        name,
        birth_date,
        death_date: death_date || '',
        nationality,
        biography,
        works,
        awards,
        updated_at: new Date().toISOString().split('T')[0]
    };
    const result = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
    );
    if (result.modifiedCount===0)
    {
        throw new Error('Failed to update the author.');
    }
    return { updateAuthor: true };
};

const removeAuthor=async (authorId) =>{
    if (!authorId)
    {
        throw new Error('The author ID must be provided.');
    }
    if (typeof authorId!== 'string' || authorId.trim() === '')
    {
        throw new Error('The author ID must be a non-empty string.');
    }
    if (!ObjectId.isValid(authorId))
    {
        throw new Error('Invalid author ID format');
    }

    const objectId =new ObjectId(authorId);
    const db = await dbConnection();
    const collection = db.collection('authors');

    const author = await collection.findOne({ _id: objectId });
    if (!author) {
        throw new Error('No author found matching the specified criteria.');
    }

    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount !== 1) {
        throw new Error('Failed to delete the author');
    }

    return `${author.name} has been successfully deleted.!`;
};

const getAuthorById = async (bookId) => {
    if(bookId===undefined)
    {
        throw new Error('Id parameter must be supplied');
    }
    if(typeof bookId!=='string')
    {
        throw new Error('Id must be a string')
    }
    if(bookId.trim()==="")
    {
        throw new Error('Id cannot be an empty string');
    }
    if (!ObjectId.isValid(bookId)) 
    {
        throw new Error('ID is not a valid Object ID');
    }
    let db=await dbConnection();
    let collection=db.collection('authors');
    let objectId=new ObjectId(bookId);
    let author=await collection.findOne({ _id:objectId });
    if(!author)
    {
        throw new Error("No authors exists with that id")
    }
     return {
          ...author,
          _id: author._id.toString()
    };
};

const getAuthorBooks = async (authorId) => {
    if (!authorId) {
        throw new Error('Author ID must be provided');
    }
    if (typeof authorId !== 'string' || authorId.trim() === '') {
        throw new Error('Author ID must be a non-empty string');
    }
    if (!ObjectId.isValid(authorId)) {
        throw new Error('Invalid author ID format');
    }

    const db = await dbConnection();
    const authorCollection = db.collection('authors');
    const booksCollection = db.collection('books');

    const author = await authorCollection.findOne({
        _id: new ObjectId(authorId)
    });

    if (!author) {
        throw new Error('Author not found');
    }

    if (!author.works || author.works.length === 0) {
        return [];
    }

    const bookObjectIds = author.works.map(bookId => new ObjectId(bookId));

    const books = await booksCollection.find({
        _id: { $in: bookObjectIds }
    }).toArray();

    return books.map(book => ({
        ...book,
        _id: book._id.toString()
    }));
};

const authors = {
    addAuthor,
    findAuthor,
    updateAuthor,
    removeAuthor,
    getAuthorById,
    getAuthorBooks
};

export default authors