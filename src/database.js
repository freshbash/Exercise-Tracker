// Connect to the database
require('dotenv').config();
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

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
const getUser = (user_id, from, to, limit) => {

    //If the optional arguments are available then convert them into correct format
    let start = from;
    let end = to;
    if (start !== null) {
        start = new Date(start);
    }
    if (end !== null) {
        end = new Date(end);
    }

    //Query from the database based on the availability of optional arguments
    if (start !== null && end === null && limit === null) {
        return User.find({_id: user_id, log: {date: {$gte: start}}});
    }
    else if (start !== null && end === null && limit !== null) {
        return User.find({_id: user_id, log: {date: {$gte: start, $slice: limit}}});
    }
    else if (start !== null && end !== null && limit === null) {
        return User.find({_id: user_id, log: {date: {$gte: from, $lte: to}}});
    }
    else if (start !== null && end !== null && limit !== null) {
        return User.find({_id: user_id, log: {date: {$gte: start, $lte: end, $slice: limit}}});
    }
    else if (start === null && end !== null && limit === null) {
        return User.find({_id: user_id, log: {date: {$lte: end}}});
    }
    else if (start === null && end !== null && limit !== null) {
        return User.find({_id: user_id, log: {date: {$lte: end, $slice: limit}}});
    }
    else if (start === null && end === null && limit !== null) {
        return User.find({_id: user_id, log: {date: {$slice: limit}}});
    }
    else {
        return User.find({_id: user_id});
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
const addWorkout = async(user_id, description, duration, date=null) => {
    let workoutDate = date;
    //Check that if workoutDate is null, then set workout date to the present date.
    if (workoutDate === null) {
        workoutDate = new Date();
    }
    else {
        workoutDate = new Date(workoutDate);
    }

    //Create the workout object
    const workout = {description: description, duration: duration, date: workoutDate};

    //Find the user with the user_id input and make the necessary updates
    return User.findByIdAndUpdate(user_id, {$inc: {count: 1}, $push: {log: workout}}, {new: true});

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
