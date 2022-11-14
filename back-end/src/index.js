import express from 'express'
import cors from 'cors'
import joi from 'joi'
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
try {
    await mongoClient.connect()
    db = mongoClient.db("batePapoUol");
} catch (error){
    console.log(error)
}

const participantSchema = joi.object({
    name: joi.string().required()
});

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message','private_message').required()
});

app.post("/participants", async (req, res) => {
    
    try {
    const { name } = req.body;

    const validationName = participantSchema.validate({name});
    console.log(validationName.error)
    if (validationName.error) {
        
        return res.sendStatus(422);
    }

    const verifyUser = await db.collection("users").findOne({
        name: name
    })

    if (verifyUser) {
        res.sendStatus(409);
    }

    const user = {
        name: name,
        lastStatus: Date.now()
    }

    const message = {
        from: name,
        to: 'todos',
        text: 'entra na sala...',
        type: 'status',
        time: 'HH:MM:SS'
    }

    await db.collection("users").insertOne(user)
    await db.collection("messages").insertOne(message)
    res.sendStatus(201);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }

});

app.get("/participants", (req, res) => {
    
    db.collection("users").find().toArray().then(users => {
        res.send(users);
    }).catch(error => {
        res.sendStatus(500)
        console.log(error)
    });
    
});

app.post("/messages", async (req, res) => {
    const { to, text, type } = req.body;
    const from = req.header.user

    try {

    const message = {
        to: to,
        text: text,
        type: type
    }

    const messageValidation = messageSchema.validate(message, {abortEarly: false});

    if (messageValidation.error) {
    console.log(messageValidation.error.details)
        res.sendStatus(422)
    }

    const verifyFrom = await db.collection("users").findOne({
        name: from
    })

    if (!verifyFrom) {
        res.sendStatus(422);
    }

    const messageDone = {
        to: to,
        text: text,
        type: type,
        from: from,
        time: 'HH:MM:SS'
    }

    await db.collection("messages").insertOne(messageDone)
    res.sendStatus(201)

    } catch (error){
        console.error(error);
        res.sendStatus(500);
    }

    
})

app.get("/messages", async (req,res) => {
    const user = req.headers.user;

    const limit = parseInt(req.query.limit);
    let limitActive = false
    if (limit) {
        limitActive = true;
    }

    if (!limit){
    await db.collection("message").find({to: user, from: user, type: "message", type: "status"}).toArray().then(users => {
        res.send(users);
    }).catch(error => {
        res.sendStatus(500)
        console.log(error)
    });
    }

    await db.collection("message").find({to: user, from: user, type: "message", type: "status"}).limit(limit).toArray().then(users => {
        res.send(users);
    }).catch(error => {
        res.sendStatus(500)
        console.log(error)
    });

})

app.post("/status", async (req, res) => {
    const user = req.header.user

    const verifyUser = await db.collection("users").findOne({
        name: user
    })

    if (!verifyUser){
        res.sendStatus(404)
    }

    await db.collection("users").updateOne({ 
        name: user
    }, { $set: { "lastStatus": Date.now()} })

    res.sendStatus(200)
})

// setInterval(inactiveUser(), 15000);

// function inactiveUser(){
    
//     const timeLimit = Date.now() - 10000

//     db.collection("users").deleteMany({ lastStatus: { $lt: timeLimit}})

// }

app.listen(4000);
