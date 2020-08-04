const express = require('express')
const routes = require('./routes/routes')

// Configuration via environment variables
const port = process.env.PORT || 3000

const app = express()

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

// Connect imported routes to Express
app.use('/', routes)