// seed.js
import { dbConnection } from './config/mongoConnection.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const authorNames = [
  'George Orwell', 'Jane Austen', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain',
  'Agatha Christie', 'J.R.R. Tolkien', 'Stephen King', 'Harper Lee', 'F. Scott Fitzgerald',
  'Gabriel García Márquez', 'Isaac Asimov', 'Leo Tolstoy', 'Charles Dickens', 'Virginia Woolf',
  'Herman Melville', 'Mary Shelley', 'Oscar Wilde', 'Douglas Adams', 'Toni Morrison'
];

const bookTitles = [
  '1984', 'Pride and Prejudice', 'Harry Potter and the Sorcerer\'s Stone', 'The Old Man and the Sea', 'Adventures of Huckleberry Finn',
  'Murder on the Orient Express', 'The Hobbit', 'The Shining', 'To Kill a Mockingbird', 'The Great Gatsby',
  'One Hundred Years of Solitude', 'Foundation', 'War and Peace', 'A Tale of Two Cities', 'Mrs Dalloway',
  'Moby-Dick', 'Frankenstein', 'The Picture of Dorian Gray', 'The Hitchhiker\'s Guide to the Galaxy', 'Beloved',
  'Animal Farm', 'Sense and Sensibility', 'Harry Potter and the Chamber of Secrets', 'For Whom the Bell Tolls', 'The Adventures of Tom Sawyer',
  'And Then There Were None', 'The Lord of the Rings', 'It', 'Go Set a Watchman', 'Tender Is the Night',
  'Love in the Time of Cholera', 'I, Robot', 'Anna Karenina', 'Great Expectations', 'Orlando',
  'Billy Budd', 'The Last Man', 'The Importance of Being Earnest', 'The Restaurant at the End of the Universe', 'Song of Solomon',
  'Down and Out in Paris and London', 'Emma', 'Harry Potter and the Prisoner of Azkaban', 'The Sun Also Rises', 'Life on the Mississippi',
  'The A.B.C. Murders', 'The Silmarillion', 'Pet Sematary', 'In Cold Blood', 'The Beautiful and Damned'
];

const genresPool = ['Fiction', 'Fantasy', 'Classic', 'Mystery', 'Horror', 'Science', 'Romance', 'Historical', 'Thriller', 'Adventure'];

const userSeeds = [
  { userId: 'alice',  firstName: 'Alice',  lastName: 'Smith',  email: 'alice@test.com',  password: 'Pass123!',  age: 25 },
  { userId: 'bob',    firstName: 'Bob',    lastName: 'Jones',  email: 'bob@test.com',    password: 'Pass123!',  age: 30 },
  { userId: 'carol',  firstName: 'Carol',  lastName: 'King',   email: 'carol@test.com',  password: 'Pass123!',  age: 28 },
  { userId: 'dave',   firstName: 'Dave',   lastName: 'Brown',  email: 'dave@test.com',   password: 'Pass123!',  age: 35 },
  { userId: 'eve',    firstName: 'Eve',    lastName: 'Wilson', email: 'eve@test.com',    password: 'Pass123!',  age: 22 }
];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = arr => arr[randomBetween(0, arr.length - 1)];
const randomDate = (startYear, endYear) => {
  const y = randomBetween(startYear, endYear);
  const m = String(randomBetween(1, 12)).padStart(2, '0');
  const d = String(randomBetween(1, 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

async function runSeed() {
  const db = await dbConnection();
  console.log('Connected to MongoDB ...');

  await Promise.all([
    db.collection('authors').deleteMany({}),
    db.collection('books').deleteMany({}),
    db.collection('users').deleteMany({}),
    db.collection('reviews').deleteMany({})
  ]);

  const authorDocs = authorNames.map(name => ({
    _id: new ObjectId(),
    name,
    birth_date: randomDate(1900, 1980),
    death_date: Math.random() > 0.5 ? randomDate(1981, 2020) : '',
    nationality: randomPick(['British', 'American', 'Colombian', 'Russian', 'French']),
    biography: `${name} was a prolific writer who contributed greatly to world literature.`,
    works: [],        
    awards: [randomPick(['Nobel Prize', 'Booker Prize', 'Pulitzer Prize'])],
    avgRating: 0,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  }));
  await db.collection('authors').insertMany(authorDocs);
  console.log(`Inserted ${authorDocs.length} authors`);


  const bookDocs = [];
  for (let i = 0; i < 50; i++) {
    const author = authorDocs[i % authorDocs.length]; 
    bookDocs.push({
      _id: new ObjectId(),
      title: bookTitles[i],
      author: author.name,
      introduction: `This is the introduction for ${bookTitles[i]}.`,
      publication_date: randomDate(1950, 2023),
      ISBN: `978-0-${randomBetween(100, 999)}-${randomBetween(10000, 99999)}-${randomBetween(0, 9)}`,
      genres: Array.from({ length: randomBetween(1, 3) }, () => randomPick(genresPool)),
      rating: randomBetween(1, 50) / 10,
      reviews: []
    });
  }
  await db.collection('books').insertMany(bookDocs);
  console.log(`Inserted ${bookDocs.length} books`);


  for (const author of authorDocs) {
    const hisBooks = bookDocs.filter(b => b.author === author.name);
    const workIds = hisBooks.map(b => b._id.toString());
    await db.collection('authors').updateOne(
      { _id: author._id },
      { $set: { works: workIds } }
    );
  }
  console.log('Linked books to authors');


  const userDocs = [];
  for (const u of userSeeds) {
    userDocs.push({
      _id: new ObjectId(),
      firstName: u.firstName,
      lastName: u.lastName,
      userId: u.userId.toLowerCase(),
      hashedPassword: await bcrypt.hash(u.password, saltRounds),
      email: u.email,
      profilePicture: '/static/profile/default.jpg',
      city: 'New York',
      state: 'NY',
      age: u.age,
      role: 'user',
      reviewIds: [],
      commentIds: []
    });
  }
  await db.collection('users').insertMany(userDocs);
  console.log(`Inserted ${userDocs.length} users`);
  const reviewDocs = [];
  const reviewTexts = [
    'Absolutely loved it!', 'A masterpiece.', 'Could not put it down.',
    'Not my cup of tea.', 'Overrated.', 'Highly recommended!',
    'Pacing was slow.', 'Great characters.', 'Predictable plot.',
    'Emotional rollercoaster.', 'Beautiful prose.', 'Disappointing ending.',
    'Fantastic world-building.', 'Loved the twists.', 'Needs a sequel!'
  ];

  for (let i = 0; i < 30; i++) {
    const book = randomPick(bookDocs);
    const user = randomPick(userDocs);
    const rating = randomBetween(1, 5);
    
    reviewDocs.push({
      _id: new ObjectId(),
      bookId: book._id, 
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`, 
      comment: randomPick(reviewTexts), 
      rating,
      createdAt: new Date(), 
      isEdited: false
    });
  }
  await db.collection('reviews').insertMany(reviewDocs);
  console.log(`Inserted ${reviewDocs.length} reviews`);


  for (const book of bookDocs) {
    const bookReviews = reviewDocs.filter(r => r.bookId.toString() === book._id.toString());
    const avg = bookReviews.reduce((sum, r) => sum + r.rating, 0) / (bookReviews.length || 1);
    await db.collection('books').updateOne(
      { _id: book._id },
      { $set: { rating: Number(avg.toFixed(2)) } }
    );
  }

  for (const author of authorDocs) {
    const authorBooks = bookDocs.filter(b => b.author === author.name);
    const bookIds = authorBooks.map(b => b._id);
    const pipeline = [
      { $match: { _id: { $in: bookIds } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ];
    const [agg] = await db.collection('books').aggregate(pipeline).toArray();
    const avg = agg ? Number(agg.avg.toFixed(2)) : 0;
    await db.collection('authors').updateOne(
      { _id: author._id },
      { $set: { avgRating: avg } }
    );
  }
  console.log('Updated ratings');

  console.log('Seed completed!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error(err);
  process.exit(1);
});