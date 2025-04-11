const express = require("express");
const cors = require("cors");
const  { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 5000;

//Middlewares
app.use(cors()); //allow frontend to access API
app.use(express.json()); //to parse JSON from request

//connection to mongobd atlas
const uri = "mongodb+srv://abhishek:gameofthrones@training101.beaazgg.mongodb.net/?retryWrites=true&w=majority&appName=training101"

//Create a MongoDB client
const client = new MongoClient(uri);
let jobsCollection;

async function startServer() {
    try {
        //connect to MongoDB
        await client.connect();
        const db = client.db("jobDashboard");
        jobsCollection = db.collection("jobs");

        console.log("Connected to MongoDB");

        //start your routes after connection
        app.listen(PORT,() => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error){
        console.error("Error connecting to MongoDB:",error);
    }
}



//Dummy in-memoty data (for now, no database)
// let jobs = []; //earlier code

//Get all jobs
app.get("/api/jobs", async (req,res) => {
    try{
        const jobs = await jobsCollection.find().toArray();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch jobs"});
    }
});

//get a job by id
app.get("/api/jobs/:id",async (req,res) => {
    try{
        const job = await jobsCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!job) return res.status(404).json({error: "Job not found"});
        res.json(job);
    } catch (error){
        res.status(500).json({error:"Failed to fetch job"});
    }
});

//Post a new job
app.post("/api/jobs", async (req,res) =>{
    try {
        const job =req.body;
        const result = await jobsCollection.insertOne(job);
        res.status(201).json({message:"Job Posted Successfully", id: result.insertedId});
    } catch (error){
        res.status(500).json({error:"Failed to post job"});
    }
});

app.delete("/api/jobs/:id", async (req,res) => {
    try {
        const result = await jobsCollection.deleteOne({ _id: new ObjectId(req.params.id)});
        if (result.deletedCount === 0) {
            return res.status(404).json({error: "Job not found"});
        }
        res.json({message: "Job deleted Successfully"});
    } catch (error) {
        res.status(500).json({error:"Failed to delete ajob"});
    }
});

startServer();