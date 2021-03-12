require("dotenv").config({ path: __dirname + "/sample.env" });

const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const User = require("./models/User");
const mongoose = require("mongoose");

morgan.token("reqbody", (req) => {
	return JSON.stringify(req.body);
});

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

const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "invalid id format!" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	} else if (error.name === "MongoError") {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

app.use(errorHandler);

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
