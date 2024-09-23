const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db("jobPortal")
    const jobCollections = db.collection("JobsList");

    //get all jobs
    app.get('/all-jobs', async (req, res) => {
      const jobs = await jobCollections.find({}).toArray()
      res.send(jobs);
    })

    //post a job
    app.post('/post-job', async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      // console.log(body)

    
      const result = await jobCollections.insertOne(body);
      if (result.insertedId) {
        return res.status(200).send(result);
      }
      else {
        return res.status(404).send({ message: "Failed to post job" })
      }
    })

    //get single job using id
    app.get("/all-jobs/:id", async (req,res)=>{
      const id = req.params.id;
      const job = await jobCollections.findOne({
        _id: new ObjectId(id)
      })

      res.send(job);

    })

    //get jobs by email
    app.get("/my-jobs/:email", async (req, res) => {
      const job = await jobCollections.find({ postedBy: req.params.email }).toArray();
      res.send(job);
    })

    //update a job
    app.patch("/update-job/:id", async (req,res)=>{
      const id = req.params.id;
      const jobData = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set:{
          ...jobData
        },
      };
      const result = await jobCollections.updateOne(filter, updateDoc,options);
      res.send(result);
    })

    //delete a job
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const result = await jobCollections.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount) {
        return res.status(200).send(result);
      }
      else {
        return res.status(404).send({ message: "Failed to delete job" })
      }
    })


    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

connectToDatabase();

app.get('/', (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
