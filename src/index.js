import express from 'express'
import cors from 'cors'
import joi from 'joi'

const app = express();
const joi = require('joi');

const participantsSchema = joi.object({
    name: joi.string().required()
})

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string.required(),
    type: joi.string().valid('message','private_message').required()
})


app.use(cors());
app.use(express.json())

//mongoDB. Falar com a Deb sobre a instalação

app.post("/participants", (req, res) => {
    const { name } = req.body;
  
    const validation = participantsSchema.validate(name);

    if (validation.error) {
    console.log(validation.error.details)
    }

    /* Busca padrão de usuário. Trocar pelo mongo quando eu conseguir instalar.
    const userNotAvaliable = users.find((user) => user.name === name);
  
    if (userNotAvaliable) {
      res.status(409).send({ error: "Usuário já existe." });
      return;
    }
    */
  
    res.status(201).send();
});

app.get("/participants", (req, res) => {

})

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body;
    const from = req.header.user

    const messageValidation = messageSchema.validate(message, {abortEarly: false});

    if (messageValidation.error) {
    console.log(validation.error.details)
    }

    /* Verificação do from aqui*/

    res.status(201).send();
})

app.listen(5000)
