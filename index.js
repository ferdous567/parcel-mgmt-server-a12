const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5174;

// middleweres
app.use(express.json())
app.use(cors())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iknar0j.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db('parcelDB').collection('users');
    const bookCollection = client.db('parcelDB').collection('books');

    // users

    app.post('/users', async(req, res) =>{
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    })

    // bookings

    app.post('/bookings', async(req, res) =>{
      const bookItems = req.body;
      const result = await bookCollection.insertOne(bookItems);
      res.send(result);
  })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Proshop parcel management app is running...')
})

app.listen(port, () => {
  console.log(`Proshop parcel app listening on port ${port}`)
})