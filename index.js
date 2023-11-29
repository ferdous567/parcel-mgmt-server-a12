const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // jwt related

    app.post('/jwt', async (req, res) => {
      const newUser = req.body;
      // console.log(newUser);
      const token = jwt.sign(newUser, process.env.SECRET_TOKEN, { expiresIn: '1h' });
      res.send({ token })
    })

    // middleweres
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized domain' })
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.SECRET_TOKEN, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: 'unauthorized domain' })
        }
        req.decoded = decoded;
        next();
      })

    }

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'Admin';

      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }
    // const verifyDeliveryMen = async(req, res, next) =>{
    //   const email = req.decoded.email;
    //   const query = {email: email};
    //   console.log('delivery query',query);
    //   const user = await userCollection.findOne(query);
    //   console.log('delivery user',user);
    //   const isDeliveryMen = user?.role === 'deliveryMen';
    //   console.log('is delivery men email',isDeliveryMen);
    //   if(!isDeliveryMen){
    //     return res.status(403).send({message: 'forbidden access'});
    //   }
    //   next();
    // }

    // users

    app.get('/users', async (req, res) => {

      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      // console.log('admin user', user);
      let admin = false;
      if (user) {
        admin = user?.role === 'Admin';
      }
      res.send({ admin });
    })


    app.get('/users/deliveryMen/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      // console.log('delivery user', user);
      let deliveryMen = false;
      if (user) {
        deliveryMen = user?.role === 'deliveryMen';
      }
      res.send({ deliveryMen });
    })



    app.post('/users', async (req, res) => {
      const newUser = req.body;
      // check email for social login
      const query = { email: newUser.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already existed', insertedId: null })
      }

      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'Admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })
    app.patch('/users/deliveryMen/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'deliveryMen'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })

    app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })


    app.get('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result)
    })

    // bookings

    app.get('/bookings/:email', verifyToken, async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email }
      console.log('query for email', query);
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/getSingleDeliveryMen/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email }
      console.log('query for email', query);
      const result = await userCollection.findOne(query);
      res.send(result);
    })


    app.get('/getSingDeliMen/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email }
      console.log('query for email', query);
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.get('/deliMenWiseBooking/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { deliveryMen: id};
      console.log('query for id', query);
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/deliveryMenWiseBooking/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { deliveryMen: id};
      console.log('query for id', query);
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/manageItems/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log('query for id', query);
      const result = await bookCollection.findOne(query);
      res.send(result);
    })

    app.patch('/manageItems/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: req.body
      };
      const result = await bookCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.patch('/updatePercel/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: req.body
      };
      const result = await bookCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/bookings', verifyToken, async(req, res) =>{
      const result = await bookCollection.find().toArray();
      res.send(result);
    })

   

    app.post('/bookings', async (req, res) => {
      const bookItems = req.body;
      const result = await bookCollection.insertOne(bookItems);
      res.send(result);
    })


     app.delete('/deleteMyBookings/:id', verifyToken,  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.deleteOne(query);
      res.send(result)
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