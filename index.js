const redis = require('redis')
const express = require('express')

const client = redis.createClient({
  host: process.env.HUB_REDIS_HOST
})
const app = express()

const port = process.env.HUB_PORT || 3000

const pkg = require('./package.json')

client.on('error', err => {
  console.trace(err)
})

app.get('/', (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version
  })
})

app.get('/:ns', (req, res) => {
  client.SMEMBERS(getNsId(req), (err, data) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        info: 'Redis side'
      })
    }

    res.json({
      value: data
    })
  })
})

app.put('/:ns/:ip', (req, res) => {
  if (req.params.ip.length > 22) {
    return res.status(400).json({
      message: 'Param too long',
      info: `You must respect this '000.000.000.000' or this '000.000.000.000:00000'`
    })
  }
  client.SADD(getNsId(req), req.params.ip, (err, data) => {
    if (err) {
      return res.status(400).json({
        message: err.message,
        info: 'Redis side'
      })
    }

    res.json({
      value: data
    })
  })
})

const getNsId = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  return `${ip}__${req.params.ns}`
}

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
