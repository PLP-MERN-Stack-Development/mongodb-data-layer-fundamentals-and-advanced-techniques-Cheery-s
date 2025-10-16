const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const dbName = "plp_bookstore";
const client = new MongoClient(uri);

async function main() {
    try {

        await client.connect();
        console.log("Connected successfully to MongoDb server");
        const db = client.db(dbName);
        const booksCollection = db.collection("books");

        /*========================== 
              TASK 5:Indexing  
            ==========================*/

        // 1. Create an index on the title field for faster search by title
       const createIndex= await booksCollection.createIndex({ title: 1 });
        console.log("Index created on title field: ", createIndex);

        // 2. Create a compound index on author and published_year for queries involving both fields
        const compoundIndex = await booksCollection.createIndex({ author: 1, published_year: 1 });
        console.log("Compound index created on author and published_year fields: ", compoundIndex);
        
        // 3.Test index performance
         const explainResult = await booksCollection
             .find({ title: "The Hobbit" })
            .explain("executionStats");
         console.log("Query execution stats:", explainResult.executionStats);

        // 4. Create a text index on the genre field for text search capabilities
        await booksCollection.createIndex({ genre: "text" });
         console.log("Text index created on genre field");
     
    } catch (err) {
        console.error("Error occured: ", err);
    } finally {
        await client.close();
        console.log("Connection closed");
    }
}
main().catch(console.error);
