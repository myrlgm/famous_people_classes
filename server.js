var express  = require('express')
var morgan   = require('morgan')
var redis    = require('redis')
var bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype)

var db = redis.createClient()
var app = express()
var template = require('jade').compileFile(__dirname + '/templates/main.jade')

app.use(morgan('dev'))
app.use(express.static(__dirname + '/static'))

db.on('error', function(err) {
 console.log('redis error: ' + err)
})

function get_instructor_name(id) {
 return db.getAsync(id + ' name')
}

function get_instructor_attributes(id) {
 return db.smembersAsync(id + ' attributes')
}

function get_video_url(id) {
 return db.getAsync(id + ' video_url')
}

function get_video_type(id) {
 return db.getAsync(id + ' video_type')
}

function get_other_courses(id) {
 return db.smembersAsync(id + ' other_courses')
}

var get_params = bluebird.Promise.coroutine(function*(id) {
 var params = {}
 params.instructor_name = yield get_instructor_name(id)
 params.title = params.instructor_name
 params.attributes = yield get_instructor_attributes(id)
 params.video_source = {
  'src': yield get_video_url(id),
 }
 params.other_courses = []
 var other_ids = yield get_other_courses(id)
 for (i in other_ids) {
  var id = other_ids[i]
  params.other_courses.push({
   'name': yield get_instructor_name(id),
   'link': '/' + id
  })
 }
 return params
})

app.get('/:id', function(req, res, next) {
  var id = req.params.id // should ideally do some filtering before going to DB
  var params = get_params(id)
  params.then(function() {
   res.send(template(params.value()))
  })
})

var port = process.env.PORT || 3000

app.listen(port, function () {
  console.log('Listening on port: ' + port)
})
