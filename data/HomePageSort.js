
import { dbConnection} from '../config/mongoConnection.js';


export const PopularityRank = async ()=>
{
    let db=await dbConnection();
    const booksCollection=await db.collection('books')
        .find()
        .sort({rating:-1})
        .limit(6)
        .toArray();
    return booksCollection;
}


export const NewBookPublish = async ()=>
{
    let db=await dbConnection();
    const Newbook=await db.collection('books')
        .find()
        .sort({_id:-1})
        .limit(6)
        .toArray();
    return Newbook;
}

