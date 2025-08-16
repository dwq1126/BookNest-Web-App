# BookNest Web App - User Guide

Github：[GitHub - dwq1126/BookNest-Web-App: An online book community platform for CS546 final project](https://github.com/dwq1126/BookNest-Web-App)

## Project Overview

BookNest is a book management web application that supports the management of book and author information, as well as user reviews, ratings, and other features. The project is developed based on Node.js, using MongoDB as the database, and includes core functionalities such as data validation, CRUD operations, and user authentication.

## Prerequisites

- **Node.js (v14+)**
- **MongoDB** (local or cloud service)
- **npm** (package management tool)

## Installation and Initialization

### 1. Environment Preparation

1. Clone the project to your local machine.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure MongoDB connection:

   - Modify the connection string in `config/mongoConnection.js` to point to your MongoDB instance.

### 2. Database Initialization

Quickly populate test data (including books, authors, users, reviews) using the seed file:

```bash
node seed.js
```

After successful execution, the database will create the following collections:

- `books`: Book information
- `authors`: Author information
- `users`: User information
- `reviews`: Review information

### 3. Website launch

```bash
npm start
```

## Core Function Usage Instructions

### 1. Book Management (`data/Book.js`)

Provides functions for adding, querying, updating, and deleting books.

#### Main Methods:

- **`addBook(title, author, introduction, publication_date, ISBN, genres)`**: Add a new book  
  - All required fields must be provided and comply with the validation rules in `Bookhelper.js` (e.g., title length 1-120 characters, correct ISBN format, etc.).

- **`findBook(title)`**: Fuzzy query books by title  
  - Returns a list of matching books (case-insensitive).

- **`updateBook(bookID, ...fields)`**: Update book information  
  - Requires the book ID and fields to be updated, with the same validation rules as the add operation.

- **`getBookById(bookId)`**: Query a single book by ID  
  - Returns detailed book information including reviews.

- **`removebook(bookID)`**: Delete a book  
  - Requires a valid book ID; the associated author's average rating will be updated after deletion.

### 2. Author Management (`data/Author.js`)

Provides functions for managing author information.

#### Main Methods:

- **`addAuthor(name, birth_date, death_date, nationality, biography, works, awards)`**: Add an author  
  - Required fields: name, date of birth, nationality, biography; optional fields: date of death, list of works, awards.

- **`findAuthor(name)`**: Fuzzy query authors by name  
  - Returns a list of matching authors.

- **`updateAuthor(authorId, ...fields)`**: Update author information  
  - Requires the author ID and fields to be updated; the list of works must be an array containing book IDs.

- **`removeAuthor(authorId)`**: Delete an author  
  - Requires a valid author ID.

### 3. Review Management (`data/Review.js` + `router/book.js`)

Supports adding, querying, and deleting reviews for books, and automatically updates book ratings.

#### Main Features:

- **Add a review**:  
  - Via the `POST /:id/reviews` endpoint in `router/book.js`, requiring user ID, rating (1-5), and review content.

- **Query reviews**:  
  - `getAllReviews(book_id)` retrieves all reviews for a specified book.

- **Delete a review**:  
  - Via the `DELETE /:bookId/reviews/:reviewId` endpoint in `router/book.js`; the book's average rating will be automatically updated after deletion.

### 4. User Authentication (`data/UserLog.js`)

Provides user registration and login functions.

#### Main Methods:

- **`signUpUser(firstName, lastName, userId, password, email, ...)`**: User registration  
  - Validates username, password (must meet complexity rules), email, etc.; passwords are stored encrypted.

- **`signInUser(userId, password)`**: User login  
  - Validates username and password, returns basic user information (including role).

## Data Validation Rules Explanation (`Bookhelper.js` + `Reviewhelper.js`)

- **Book title**: 1-120 characters, supporting letters, numbers, spaces, hyphens, etc.; cannot start or end with spaces/hyphens/colons.
- **ISBN**: Supports 10 or 13 digits, automatically ignores hyphens and spaces, must pass check digit verification.
- **Publication date**: Format `YYYY-MM-DD`, year not exceeding the current year, valid date.
- **Review**: Content no more than 2000 characters, rating must be an integer between 1-5.
- **Author information**: Name 1-80 characters, date of birth cannot be later than the current date, date of death cannot be earlier than the date of birth.

## Routing Instructions (`router/book.js`)

- **`GET /:id`**: Get book details (including author information and reviews)
- **`POST /:id/reviews`**: Submit a book review
- **`DELETE /:bookId/reviews/:reviewId`**: Delete a specified review

## Notes

1. Ensure the MongoDB service is running for all operations.
2. Data validation is strict; operations that do not comply with the rules will throw errors (need to be caught and handled in business code).
3. The seed file `seed.js` will clear existing data and populate test data; use with caution in production environments.
