// Connect to the database
require('dotenv').config();
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

//Schema
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: trusted
    },
    count: Number,
    log: [Object]
});

//Model
const User = mongoose.model("User", userSchema);

//Create a document
const createUser = (username) => {
    const user = new User({
        username: username,
        count: 0,
        log: []
    });
    user.save();
}

//Get the user with the given id
const getUser = (user_id) => {
    return User.findById(user_id);
}

//Add a workout
const addWorkout = async (user_id, description, duration, date=null) => {
    let workoutDate = date;
    //Check that if workoutDate is null, then set workout date to the present date.
    if (workoutDate === null) {
        workoutDate = new Date();
        workoutDate = workoutDate.toDateString();
    }
    //Find the user with the user_id input
    const doc = await getUser(user_id);

    //Update the document appropriately with the given user inputs
    doc.count = doc.count + 1;
    doc.log.push({description: description, duration: duration, date: workoutDate});
    //Save the changes
    doc.save();
}

//Get all the users
const getAllUsers = () => {
    return User.find({}, '_id username');
}

//Export the functions
exports.createUser = createUser;
exports.getUser = getUser;
exports.addWorkout = addWorkout;
exports.getAllUsers = getAllUsers;