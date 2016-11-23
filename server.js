var express = require('express')
var morgan  = require('morgan')
var redis   = require('redis')

var db = redis.createClient()
var app = express()
var template = require('jade').compileFile(__dirname + '/templates/main.jade')

app.use(morgan('dev'))
app.use(express.static(__dirname + '/static'))

db.on('error', function(err) {
 console.log('redis error: ' + err)
})

function get_instructor_name(id) {
 return db.get(id + ' name')
}

function get_instructor_attributes(id) {
 return db.smembers(id + ' attributes')
}

function get_video_url(id) {
 return db.get(id + ' video_url')
}

function get_video_type(id) {
 return db.get(id + ' video_type')
}

function get_other_courses(id) {
 return db.smembers(id + ' other_courses')
}

function get_params(id) {
 var params = {}
 params.instructor_name = get_instructor_name(id)
 params.title = params.instructor_name
 params.attributes = get_instructor_attributes(id)
 params.video_source = {
  'src': get_video_url(id),
 }
 params.other_courses = []
 var other_ids = get_other_courses(id)
 for (i in other_ids) {
  var id = other_ids[i]
  params.other_courses.append({
   'name': get_instructor_name(id),
   'link': '/' + id
  })
 }
 return params
}

app.get('/:id', function(req, res, next) {
  var id = req.params.id // should ideally do some filtering before going to DB
  res.send(template(get_params(id)))
})

var port = process.env.PORT || 3000

app.listen(port, function () {
  console.log('Listening on port: ' + port)
})
