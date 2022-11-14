import express from 'express'
import cors from 'cors'
import joi from 'joi'
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let participationValid = true;

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
	db = mongoClient.db("batePapoUol");
    users = db.collection("users");
}).catch(error => console.log(error));

const joi = require('joi');

const participantSchema = joi.object({
    name: joi.string().required()
});

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string.required(),
    type: joi.string().valid('message','private_message').required()
});

const dayjs = require('dayjs')
dayjs().format()

app.post("/participants", async (req, res) => {
    const { name } = req.body;
  
    const validation = participantSchema.validate(name);

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    }

    db.collection("users").findOne({
        name: name
    }).then(user => {
        participationValid = false
        console.log(user);
        res.sendStatus(409);
    });

    if (participationValid === true) {
        const user = {
            name: name, 
            lastStatus: Date.now()
        }

        try {
            await db.collection("users").insertOne(user)
            res.sendStatus(201);
          } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }

        const message = {
            from: name, 
            to: 'todos', 
            text: 'entra na sala...', 
            type: 'status',
            time: 'HH:MM:SS'
        }

        try {
            await db.collection("message").insertOne(message)
            res.sendStatus(201);
          } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    }

    res.status(201).send();
});

app.get("/participants", (req, res) => {
    
    db.collection("users").find().toArray().then(users => {
        res.send(users);
    }).catch(error => {
        res.sendStatus(500)
        console.log(error)
    });
    
});

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body;
    const from = req.header.user

    db.collection("users").findOne({
        name: from
    }).then(user => {

    });

    const message = {
        to: to,
        text: text,
        type: type
    }

    const messageValidation = messageSchema.validate(message, {abortEarly: false});

    if (messageValidation.error) {
    console.log(validation.error.details)
    }

    const messageDone = {
        to: to,
        text: text,
        type: type,
        from: from,
        time: 'HH:MM:SS'
    }

    res.status(201).send();
})

app.post("/status", (req, res) => {
    const user = req.header.user

    db.collection("users").findOne({
        name: user
    }).then(user => {
        console.log(user);
    }).catch(error => {
        res.sendStatus(404)
    });

    res.status(200).send();
})

app.listen(5000);
