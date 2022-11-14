import express from 'express'
import cors from 'cors'
import joi from 'joi'
import dayjs from 'dayjs'
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

dayjs().format()

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
        return res.sendStatus(409);
    }

    const user = {
        name: name,
        lastStatus: Date.now()
    }

    const correctTime = timeConvert(user.lastStatus)

    const message = {
        from: name,
        to: 'todos',
        text: 'entra na sala...',
        type: 'status',
        time: correctTime
    }

    await db.collection("users").insertOne(user)
    await db.collection("messages").insertOne(message)
    return res.sendStatus(201);

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }

});

app.get("/participants", (req, res) => {
    
    db.collection("users").find().toArray().then(users => {
        res.send(users);
    }).catch(error => {
        return res.sendStatus(500)
    });
    
});

app.post("/messages", async (req, res) => {
    const { to, text, type } = req.body;
    const from = req.headers.user

    try {

    const message = {
        to: to,
        text: text,
        type: type
    }

    const messageValidation = messageSchema.validate(message, {abortEarly: false});

    if (messageValidation.error) {
    console.log(messageValidation.error.details)
        return res.sendStatus(422)
    }

    const verifyFrom = await db.collection("users").findOne({
        name: from
    })

    if (!verifyFrom) {
        return res.sendStatus(422);
    }

    const correctTime = timeConvert(user.lastStatus)

    const messageDone = {
        to: to,
        text: text,
        type: type,
        from: from,
        time: correctTime
    }

    await db.collection("messages").insertOne(messageDone)
    return res.sendStatus(201)

    } catch (error){
        console.error(error);
        return res.sendStatus(500);
    }

    
})

app.get("/messages", async (req,res) => {

    try{
    const user = req.headers.user;

    const limit = parseInt(req.query.limit);
    let limitActive = false
    if (limit) {
        limitActive = true;
    }

    let finalMessages =[]

    if (!limit){
    await db.collection("messages").find().toArray().then(users => {
        finalMessages.push(users);
    })
    } else {
        await db.collection("messages").find().limit(limit).toArray().then(users => {
            finalMessages.push(users);
        })
    }

    const filtered = finalMessages.filter(messageFilter)

    return res.send(filtered)
    } catch (error){
        console.error(error);
        return res.sendStatus(500);
    }
})

app.post("/status", async (req, res) => {
    const user = req.header.User

    const verifyUser = await db.collection("users").findOne({
        name: user
    })

    if (!verifyUser){
        return res.sendStatus(404)
    }

    await db.collection("users").updateOne({ 
        name: user
    }, { $set: { "lastStatus": Date.now()} })

    return res.sendStatus(200)
})

setInterval(inactiveUser, 15000);

function inactiveUser(){
    
    const timeLimit = Date.now() - 10000

    db.collection("users").deleteMany({ lastStatus: { $lt: timeLimit}})

}

function timeConvert (dateNow){

    const ss = (dateNow/1000)%60
    const mm = (dateNow/60000)%60
    const hh = (dateNow/3600000)%24

    const timeString = `${hh}:${mm}:${ss}`

    return timeString;

}

function messageFilter (value){
    if (value.type === 'message'){
    return value
    }

    if (value.type === 'status'){
        return value
    }

    if (value.from === user){
        return value
    }

    if (value.to === user){
        return value
    }
    
}

app.listen(5000);
