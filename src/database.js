// Connect to the database
require('dotenv').config();
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//Schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
});

//Model
const User = mongoose.model("User", userSchema);

//Get the user with the given id
const getUser = async (user_id, start, end, num) => {

  //Create an ObjectId with the given user_id to query the database
  const id = new mongoose.Types.ObjectId(user_id);

  //Query from the database based on the availability of optional arguments
  if (start !== null && end === null && num === null) {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: {
            $filter: {
              input: '$log',
              as: 'log',
              cond: { $gte: ['$$log.date', start] }
            }
          }
        }
      }
    ])
  }
  else if (start !== null && end === null && num !== null) {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: {
            $filter: {
              input: '$log',
              as: 'log',
              cond: { $gte: ['$$log.date', start] }
            }
          }
        }
      }
    ])
  }
  else if (start !== null && end !== null && num === null) {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: {
            $filter: {
              input: '$log',
              as: 'log',
              cond: {
                $and: [
                  { $gte: ['$$log.date', start] },
                  { $lte: ['$$log.date', end] }
                ]
              }
            }
          }
        }
      }
    ]);
  }
  else if (start !== null && end !== null && num !== null) {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: {
            $filter: {
              input: '$log',
              as: 'log',
              cond: {
                $and: [
                  { $gte: ['$$log.date', start] },
                  { $lte: ['$$log.date', end] }
                ]
              }
            }
          }
        }
      }
    ]);
  }
  else if (start === null && end !== null && num === null) {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: {
            $filter: {
              input: '$log',
              as: 'log',
              cond: { $lte: ['$$log.date', end] }
            }
          }
        }
      }
    ])
  }
  else if (start === null && end !== null && num !== null) {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: {
            $filter: {
              input: '$log',
              as: 'log',
              cond: { $lte: ['$$log.date', end] }
            }
          }
        }
      }
    ])
  }
  else {
    return User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          username: 1,
          log: 1
        }
      }
    ])
  }
}

//Create a document
const createUser = async (username) => {
  const user = new User({
    username: username,
    count: 0,
    log: []
  });
  return user.save();
}

//Add a workout
const addWorkout = async (user_id, description, duration, date = null) => {
  //Check that if workoutDate is null, then set workout date to the present date.
  let workoutDate = date ? new Date(date) : new Date();

  //Create the workout object
  const workout = { description: description, duration: duration, date: workoutDate };

  //Find the user with the user_id input and make the necessary updates
  return User.findByIdAndUpdate(user_id, { $inc: { count: 1 }, $push: { log: workout } }, { upsert: true, new: true });

}

//Get all the users
const getAllUsers = () => {
  return User.find({}, '_id username');
}

//Export the functions
exports.getUser = getUser;
exports.createUser = createUser;
exports.addWorkout = addWorkout;
exports.getAllUsers = getAllUsers;
