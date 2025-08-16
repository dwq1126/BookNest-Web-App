import { ObjectId } from 'mongodb';
import { helper } from './Bookhelper.js';
import { dbConnection } from '../config/mongoConnection.js';

const addBook = async (
    title,
    author,
    introduction,
    publication_date,
    ISBN,
    genres
) => {
    if (!title || !author || !introduction || !publication_date || !ISBN || !genres) {
        throw new Error('All fields need to have valid values');
    }
    if (typeof title !== 'string' || typeof author !== 'string' || typeof introduction !== 'string' || typeof publication_date !== 'string'
        || typeof ISBN !== 'string') {
        throw new Error('Title, author, introduction, publication_date, ISBN must be strings.');
    }
    if (title.trim() === "" || author.trim() === "") {
        throw new Error("Title, author cannot be left blank.");
    }
    if (introduction.trim() === "" || ISBN.trim() === "") {
        throw new Error("introduction, ISBN cannot be left blank.");
    }
    title = await helper.VerifyTitle(title);
    author = await helper.VerifyAuthor(author);
    introduction = await helper.VerifyIntroduction(introduction);
    ISBN = await helper.VerifyISBN(ISBN);
    publication_date = await helper.Verifypublication_date(publication_date);
    genres = await helper.Verifygenres(genres);
    let reviews = [];
    let rating = 0;
    let db = await dbConnection();
    let collection = db.collection('books');
    const booksCollection = db.collection('books');
    const sameName = await booksCollection.findOne({
        title: { $regex: '^' + title.trim() + '$', $options: 'i' }
    });

    if (sameName) {
        throw new Error('The book "' + title + '" already exists and cannot be added repeatedly.');
    }
    let bookData = {
        title: title,
        author: author,
        introduction: introduction,
        publication_date: publication_date,
        ISBN: ISBN,
        genres: genres,
        rating: rating,
        reviews: reviews,
    };
    let result = await collection.insertOne(bookData);
    if (result.acknowledged && result.insertedId) {
        await helper.refreshAuthorAvg(author);
        return true
    } else {
        throw new Error("Adding book failed.");
    }
}


const findBook = async (title) => {
    if (title === undefined) {
        throw new Error('Id parameter must be supplied');
    }
    if (typeof title !== 'string') {
        throw new Error('Id must be a string')
    }
    if (title.trim() === "") {
        throw new Error('Id cannot be an empty string');
    }
    let db = await dbConnection();
    let collection = db.collection('books');
    let query = {
        title: { $regex: title.trim(), $options: 'i' }
    };
    let books = await collection.find(query).toArray();
    if (!books) {
        throw new Error("No book exists with that title")
    }
    return books.map(book => ({
        ...book,
        _id: book._id.toString()
    }));
};


const updateBook = async (
    bookID,
    title,
    author,
    introduction,
    publication_date,
    ISBN,
    genres
) => {
    if (!title || !author || !introduction || !publication_date || !ISBN || !genres) {
        throw new Error('All fields need to have valid values');
    }
    if (typeof title !== 'string' || typeof author !== 'string' || typeof introduction !== 'string' ||
        typeof publication_date !== 'string' || typeof ISBN !== 'string') {
        throw new Error('Title, author, introduction, publication_date, ISBN must be strings.');
    }
    if (title.trim() === "" || author.trim() === "") {
        throw new Error("Title, author cannot be left blank.");
    }
    if (introduction.trim() === "" || ISBN.trim() === "") {
        throw new Error("introduction, ISBN cannot be left blank.");
    }
    if (!ObjectId.isValid(bookID)) {
        throw new Error('Invalid book ID format');
    }
    title = await helper.VerifyTitle(title);
    author = await helper.VerifyAuthor(author);
    introduction = await helper.VerifyIntroduction(introduction);
    ISBN = await helper.VerifyISBN(ISBN);
    publication_date = await helper.Verifypublication_date(publication_date);
    genres = await helper.Verifygenres(genres);

    const db = await dbConnection();
    const collection = db.collection('books');
    const objectId = new ObjectId(bookID);
    const existingBook = await collection.findOne({ _id: objectId });
    if (!existingBook) {
        throw new Error('Book not found with the provided ID');
    }
    const updateData = {
        title,
        author,
        introduction,
        publication_date,
        ISBN,
        genres
    };
    const result = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
    );
    if (result.modifiedCount === 0) {
        throw new Error('Updating book failed');
    }
    const updatedBook = await collection.findOne({ _id: objectId });
    await helper.refreshAuthorAvg(updateData.author);
    return { success: true };
};


const getBookById = async (bookId) => {
    if (bookId === undefined) {
        throw new Error('Id parameter must be supplied');
    }
    if (typeof bookId !== 'string') {
        throw new Error('Id must be a string')
    }
    if (bookId.trim() === "") {
        throw new Error('Id cannot be an empty string');
    }
    if (!ObjectId.isValid(bookId)) {
        throw new Error('ID is not a valid Object ID');
    }
    let db = await dbConnection();
    let collection = db.collection('books');
    let objectId = new ObjectId(bookId);
    let book = await collection.findOne({ _id: objectId });

    if (!book) {
        throw new Error("No book exists with that id");
    }

    if (!book.reviews) {
        book.reviews = [];
    }

    return {
        ...book,
        _id: book._id.toString()
    };
};

const removebook = async (bookID) => {
    if (bookID === undefined) {
        throw new Error('Id parameter must be supplied');
    }
    if (typeof bookID !== 'string') {
        throw new Error('Id must be a string')
    }
    if (bookID.trim() === "") {
        throw new Error('Id cannot be an empty string');
    }
    if (!ObjectId.isValid(bookID)) {
        throw new Error('ID is not a valid Object ID');
    }

    let db = await dbConnection();
    let collection = db.collection('books');
    let objectId = new ObjectId(bookID);
    let book = await collection.findOne({ _id: objectId });

    if (!book) {
        throw new Error("No book exists with that id")
    }

    let result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount !== 1) {
        throw new Error('Failed to delete book');
    }

    await helper.refreshAuthorAvg(book.author);
    return { success: true, message: `${book.title} has been successfully deleted!` };
};


const books = {
    addBook,
    removebook,
    updateBook,
    findBook,
    getBookById,
    removebook,
};

export default books