const express = require('express')
const path = require('path')
const recipesApi = require('./server/routes/recipesApi')

const app = express()
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', recipesApi)


const port = 3001
app.listen(port, function() {
    console.log(`Server running on ${port}`)
})