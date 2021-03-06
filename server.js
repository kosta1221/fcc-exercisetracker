require("dotenv").config({ path: __dirname + "/sample.env" });

const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const User = require("./models/User");
const _ = require("lodash");
const utils = require("./utils");

morgan.token("reqbody", (req) => {
	return JSON.stringify(req.body);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :reqbody"));

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

// POST route to /api/exercise/new-user for adding a new user with username
app.post("/api/exercise/new-user", (req, res, next) => {
	const { username } = req.body;

	const newUser = new User({ username });
	newUser
		.save()
		.then((savedUser) => {
			res.json(savedUser);
		})
		.catch((error) => next(error));
});

// GET route to /api/exercise/users returns an array of all users. Each element in the array is an object containing a user's username and _id.
app.get("/api/exercise/users", (req, res, next) => {
	User.find({})
		.select("-exercises")
		.then((users) => {
			res.status(200).json(users);
		});
});

// POST route to /api/exercise/add for adding an exercise to an exsiting user by his id
app.post("/api/exercise/add", (req, res, next) => {
	const _id = req.body.userId;
	const { description } = req.body;
	const { duration } = req.body;

	let reqBodyDate;
	if (req.body.date) {
		reqBodyDate = new Date(req.body.date);
	}
	const date = reqBodyDate || new Date();

	User.findById(_id)
		.then((foundUser) => {
			const username = foundUser.username;
			foundUser.exercises.push({ description, duration, date });

			User.findOneAndUpdate({ _id: _id }, { exercises: foundUser.exercises }, { new: true })
				.then((foundAndUpdatedUser) => {
					res.json({
						_id,
						username,
						date: utils.toFccDateFormat(
							foundAndUpdatedUser.exercises[foundAndUpdatedUser.exercises.length - 1].date
						),
						duration: +duration,
						description,
					});
				})
				.catch((error) => next(error));
		})
		.catch((error) => next(error));
});

// GET route to /api/exercise/log?userId=<userId> to retrieve a full exercise log of any user
app.get("/api/exercise/log", (req, res, next) => {
	const userId = req.query.userId;
	let from = req.query.from;
	let to = req.query.to;
	const limit = Number(req.query.limit);

	if (from) from = new Date(from);
	if (to) to = new Date(to);

	User.findById(userId)
		.then((foundUser) => {
			const _id = foundUser.id;
			const username = foundUser.username;

			let log = _.cloneDeep(foundUser.exercises);

			if (limit) {
				log = log.filter((exercise, index) => index < limit);
			}

			log.forEach((exercise) => {
				exercise.date = utils.toFccDateFormat(exercise.date);
			});

			if (from && to) {
				console.log(foundUser.exercises);
				const logUnlimited = foundUser.exercises.filter(
					(exercise) =>
						exercise.date.getTime() > from.getTime() && exercise.date.getTime() < to.getTime()
				);
				const logUnlimitedClone = _.cloneDeep(logUnlimited);
				logUnlimitedClone.forEach((exercise) => {
					exercise.date = utils.toFccDateFormat(exercise.date);
				});

				log = logUnlimitedClone;
			}

			const count = log.length;

			res.json({ _id, username, count, log });
		})
		.catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
	console.error(error);
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "invalid id format!" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	} else if (error.name === "MongoError") {
		return response.status(400).json({ error: error.message });
	}

	return response.status(400).json({ error: error.message });
};

app.use(errorHandler);

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
