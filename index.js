require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')
const person = require('./models/person')
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

require('dotenv').config()
const baseUrl = '/api/persons'




//Creating a token for getting req.body POST
morgan.token('body', req => {
  return JSON.stringify(req.body)
})


app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['body'](req)
  ].join(' ')
}))

app.use(express.json())


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get(baseUrl, (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'The name or number is missing'
    })
  }
  const person = new Person({
    "name": body.name,
    "number": body.number
  })

  person.save()
    .then(savedPerson => {
      console.log(`added ${savedPerson.name} phone ${savedPerson.number} to phonebook`)
      res.json(savedPerson)
    })
    .catch(err => next(err))


  /**Part 3a */

  // } else if (persons.some(person => person.name === body.name)) {
  //   return res.status(400).json({
  //     error: 'The name already existing in the phonebook'
  //   })
  // }
})

app.put('/api/persons/:id', (req, res, next) => {

  const {name, number} = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    req.params.id,
    {name, number},
    {new: true, runValidators: true, context:'query'}
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(err => next(err))

  /**Previous exercises */
  // const id = req.params.id
  // const body = req.body
  // const person = persons.find(person => person.id === id)

  // if (!person) {
  //   return res.status(404).json({ error: 'Person not found' })
  // }

  // const updatedPerson = {
  //   ...person,
  //   name: body.name,
  //   number: body.number
  // }
  // persons = persons.map(person => person.id !== id ? person : updatedPerson)

  // res.json(updatedPerson)


})

app.get('/api/persons/:id', (request, response, next) => {
  // part 3a
  // const id = request.params.id
  // const person = persons.find(person => person.id === id)
  // if (person) {
  //   response.json(person)
  // } else {
  //   console.log('x')
  //   response.status(404).end()
  // }

  //part 3c

  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(err => next(err))

})

app.delete('/api/persons/:id', (request, response, next) => {
  /**part3a */
  // const id = Number(request.params.id)
  // persons = persons.filter(person => person.id !== id)

  // response.status(204).end()

  /**part3c */
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(err => next(err))
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})