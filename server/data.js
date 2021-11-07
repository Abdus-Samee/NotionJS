var express = require('express');
const mongoose = require('mongoose');

var router = express.Router();

mongoose.connect('mongodb+srv://Abdus:21@reactnodejs.x16i5.mongodb.net/taskDB', {useNewUrlParser : true, useUnifiedTopology: true })

const taskSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  teamId: mongoose.Schema.Types.ObjectId
})

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  sub: {
    type: String,
    required: true
  },
  teams: [teamSchema]
})

const User = mongoose.model('User', userSchema)
const Team = mongoose.model('Team', teamSchema)
const Task = mongoose.model('Task', taskSchema)

router.get('/', (req, res, next) => {
  Task.find({}, function(err, taskList){
    res.send(taskList)
  })
  //res.send('API is working...')
})

router.post('/', (req, res, next) => {
  const task = new Task({
    content: req.body.task,
    category: req.body.category,
    teamId: req.body.teamId
  })

  task.save()

  res.send('Added data successfully...')
})

router.get('/teams/:id', (req, res, next) => {
  const id = req.params.id

  console.log(id)

  Task.find({teamId: id}, (err, ans) => {
    if(!err){
      res.send(ans)
    }else{
      res.send('Error occured...')
    }
  })
})

router.post('/edit', (req, res, next) => {
  const teamId = req.body.teamId
  const taskId = req.body.taskId
  const cat = req.body.dest

  console.log('Getting request for edit...')
  console.log(teamId, taskId, cat)

  Task.findOne({_id: taskId}, (err, ans) => {
    if(!err){
      ans.category = cat
      ans.save()

      res.send('Data edited successfully...')
    }else{
      res.send('Data not found...')
    }
  })
})

router.post('/user', (req, res, next) => {
  const name = req.body.name
  const email = req.body.email
  const sub = req.body.sub

  console.log(name, email, sub)

  User.findOne({sub: sub}, (err, ans) => {
    if(err){
      res.send('Error occured...')
    }
    else if(ans){
      console.log(ans)
      console.log('User already registered...')

      res.send(ans)
    }else{
      const user = new User({
        name: name,
        email: email,
        sub: sub
      })

      user.save()

      res.send('User registered...')
    }
  })
})

router.post('/team', (req, res, next) => {
  const name = req.body.name
  const sub = req.body.sub

  console.log(name, sub)

  const team = new Team({
    name: name
  })

  team.save()

  User.findOne({sub: sub}, (err, ans) => {
    if(!err){
      ans.teams.push(team)
      ans.save()

      res.send('Team added successfully...')
    }else{
      res.send('Error occured...')
    }
  })
})

router.post('/join', (req, res, next) => {
  const userId = req.body.userId
  const joinTeam = req.body.joinTeam

  console.log(userId, joinTeam)

  Team.findOne({_id: joinTeam}, (err, ans) => {
    if(!err){
      if(ans){
        User.findOne({sub: userId}, (err, rep) => {
          rep.teams.push(ans)
          rep.save()

          res.send('Team added to user data successfully...')
        })
      }
    }else{
      res.send('Error finding team or user...')
    }
  })
})

module.exports = router
