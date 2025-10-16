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
              TASK 2  
            ==========================*/

    // 1. Find all books in a specific genre
    const book_genre = "Dystopian";

    const dystopianBook = await booksCollection
      .find({
        genre: book_genre,
      })
      .toArray();
    console.log("Dystopian Books:", dystopianBook);

    //     // 2. Find all books published after a certain year > 1937
    const modernBooks = await booksCollection
      .find({ published_year: { $gt: 1937 } })
      .toArray();
    console.log("\nBooks published after 1937:", modernBooks);

    //     // 3. Find all books by a specific author
    const aldousBooks = await booksCollection
      .find({ author: "Aldous Huxley" })
      .toArray();
    console.log("\nBooks by Aldous Huxley:", aldousBooks);

    //     //4. Update price of a specific book
    const updateResult = await booksCollection.updateOne(
      { title: "Wuthering Heights" },
      { $set: { price: 40.99 } }
    );
    console.log("\nUpdated Wuthering Heights price:", updateResult);
    console.log(
      "\nUpdated Wuthering Heights price:",
      updateResult.modifiedCount
    );

    const createBook = await booksCollection.insertOne({
      title: "Old School Living",
      author: "Ibrom Mayama",
      genre: "Old School",
      published_year: 1995,
      price: 5.99,
      in_stock: true,
      pages: 62,
      publisher: "Illustrious World Limited",
    });
    console.log("\nCreated book:", createBook);

    //     // 5. Delete books below a certain price < 10

    const deleteResult = await booksCollection.deleteOne({
      title: "Old School Living",
    });
    console.log("\nDeleted book:", deleteResult);

    //     /*=====================================
    //        TASK 3:Advanced Queries
    //       =====================================*/
    //     //  1. Books that are both in stock and published after 2010

    const recentInStock = await booksCollection
      .find({
        in_stock: true,
        published_year: { $gt: 2010 },
      })
      .toArray();
    console.log("\nRecent in-stock books:", recentInStock);

    //     // 2. Projection: only title, author, price
    const projectedBooks = await booksCollection
      .find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } })
      .toArray();
    console.log("\nProjected books:", projectedBooks);
    //     // 3. Implement sorting to display books by price (both ascending and descending)
    const booksSortedByPriceAsc = await booksCollection
      .find({})
      .sort({ price: 1 })
      .toArray();
    console.log("\nBooks sorted by price (ascending):", booksSortedByPriceAsc);

    const booksSortedByPriceDesc = await booksCollection
      .find({})
      .sort({ price: -1 })
      .toArray();
    console.log("\nBooks sorted by price (ascending):", booksSortedByPriceDesc);

    //     // 4. Implement pagination (5 books per page)
    const page = 1;
    const booksPerPage = 5;
    const paginatedBooks = await booksCollection
      .find({})
      .skip((page - 1) * booksPerPage)
      .limit(booksPerPage)
      .toArray();
    console.log("\nPage 1 (5 books): ", paginatedBooks);

    //     /*=====================================
    //    TASK 4: Aggregation Pipeline
    //   =====================================*/

    const averagePriceByGenre = await booksCollection
      .aggregate([
        {
          $group: {
            _id: "$genre",
            averagePrice: { $avg: "$price" },
          },
        },
        { $sort: { averagePrice: 1 } },
      ])
      .toArray();
    console.log("\nAverage price by genre:", averagePriceByGenre);
    //     // 2. Author with most books
    const authorWithMostBooks = await booksCollection
      .aggregate([
        {
          $group: {
            _id: "$author",
            bookCount: { $sum: 1 },
          },
        },
        {
          $sort: { bookCount: -1 },
        },
        {
          $limit: 1,
        },
      ])
      .toArray();
    console.log("\nAuthor with most books:", authorWithMostBooks[0]);

    //     // 3. Books grouped by publication decade
         const booksByDecade = await booksCollection.aggregate([
             {
                $addFields: {
                     decade: {
                        $subtract: ["$published_year", 
                            { $mod: ["$published_year", 10] }
                        ]
                    }
                }
             },
             {
                 $group: {
                    _id: "$decade",
                    count: { $sum: 1 },
                    books: { $push: "$title" }
             }
             },
             {
                 $sort: { _id: 1 }
             }

            ]).toArray();
            console.log('\nBooks grouped by decade:', booksByDecade);
  } catch (err) {
    console.error("Error occured: ", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}
main().catch(console.error);
