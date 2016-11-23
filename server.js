var express = require('express')
var morgan  = require('morgan')
var redis   = require('redis')

var client = redis.createClient()
var app = express()
var template = require('jade').compileFile(__dirname + '/templates/main.jade')

app.use(morgan('dev'))
app.use(express.static(__dirname + '/static'))

client.on('error', function(err) {
 console.log('redis error: ' + err)
})

app.get('/:id', function(req, res, next) {
  var id = req.params.id // should ideally do some filtering before going to DB
  var params = {}
  params.title = 'pie'
  params.instructor_name = id
  params.attributes = ['suh', 'hi', 'bar']
  params.video_source = {'baz': 'foo'}
  res.send(template(params))
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})
