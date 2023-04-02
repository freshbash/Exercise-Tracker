const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Local: ', `http://localhost:${listener.address().port}`);
})

//Post requests
//To create and save a user
app.route('/api/users').post(async(req, res) => {
  //Get the user inputted username
  const username = req.body.username;
  //Create and save the user
  const newUser = await require('./src/database.js').createUser(username);
  //Serve json with the details of the newly created user
  res.json({"username": newUser.username, "_id": newUser._id});
});

//To find a user with the given id and add a workout
app.route('/api/users/:id/exercises').post(async(req, res) => {
  //Get the user inputted details
  const user_id = req.body[':_id'];
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;

  //Find the user with user_id and add the workout to the user's log
  const updatedUser = await require('./src/database.js').addWorkout(user_id, description, duration, date ? date : null);
  //After updation get the recently added workout for the user
  const addedWorkout = updatedUser.log[updatedUser.log.length - 1];
  
  //Serve the json with the user details and the recently added workout.
  res.json({
    "_id": updatedUser._id,
    "username": updatedUser.username,
    "date": addedWorkout.date.toDateString(),
    "duration": addedWorkout.duration,
    "description": addedWorkout.description
  });
});


//Get requests
//Get all the users
app.route('/api/users').get(async(req,res) => {
  //Get all the users in an array
  const allUsers = await require('./src/database.js').getAllUsers();
  //Send an Http response with the array
  res.send(allUsers);
});

//Get the details of a particular user
app.route('/api/users/:id/logs').get(async (req, res) => {
  //Get the user input
  const user_id = req.params.id;

  //Check the availability of optional arguments
  const from = req.query.from === undefined ? null : req.query.from;
  const to = req.query.to === undefined ? null : req.query.to;
  const limit = req.query.limit === undefined ? null : parseInt(req.query.limit);

  //Query the database
  const result = await require("./src/database.js").getUser(user_id, from, to, limit);

  //Respond with a JSON with all the dates converted to date string.
  res.json({"_id": result[0]._id,
  "username": result[0].username,
  "count": result[0].count,
  "log": result[0].log.map((e, i, a) => {
      return ({
        "description": e.description,
        "duration": e.duration,
        "date": e.date.toDateString()
      });
    })
  });
});
