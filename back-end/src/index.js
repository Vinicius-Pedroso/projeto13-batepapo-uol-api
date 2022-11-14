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

const mongoClient = new MongoClient("mongodb://localhost:27017");
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
            name: 'xxx', 
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
        /*time: dayjsfunction*/
    }

    res.status(201).send();
})

app.listen(5000)

//{name: 'João', lastStatus: 12313123}
//{from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'}
