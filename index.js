const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const baseUrl = '/api/persons'
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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
  response.json(persons)
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (req, res) => {
  const body = req.body
  
  if (!body.name || !body.number)  {
    return res.status(400).json({
      error: 'The name or number is missing'
    })
  } else if (persons.some(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'The name already existing in the phonebook'
    })
  }
  const person = {
    "id": generateId(),
    "name": body.name,
    "number": body.number
  }
  persons = persons.concat(person)
  res.json(person)
 
})

app.put('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const body = req.body
    const person = persons.find(person => person.id === id)

    if (!person) {
        return res.status(404).json({ error: 'Person not found' })
    }

    const updatedPerson = {
        ...person, 
        name: body.name,
        number: body.number
    }
    persons = persons.map(person => person.id !== id ? person : updatedPerson)
    
    res.json(updatedPerson)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    console.log('x')
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})