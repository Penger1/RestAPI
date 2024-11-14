var express = require("express");
var app = express();
const mongoose = require("mongoose");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Use JSON parsing

// Use dotenv
require('dotenv').config();

// Environment variables from .env
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

mongoose.set("strictQuery", false);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB 🫶");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

// Define a schema and model for movies
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    genre: String,
    director: String
});

const Movie = mongoose.model("Movie", movieSchema);

// GET route to fetch all movies
app.get("/api/getall", async function (req, res) {
    try {
        const movies = await Movie.find().limit(10).exec();
        res.send(movies);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching movies");
    }
});

// GET route to fetch a movie by ID
app.get("/api/:id", async function (req, res) {
    const { id } = req.params;

    try {
        const movie = await Movie.findById(id);
        if (movie) {
            res.send(movie);
        } else {
            res.status(404).send("Movie not found");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching movie by ID");
    }
});

// POST route to add a movie
app.post("/api/add", async function (req, res) {
    const { title, year, genre, director } = req.body;

    const newMovie = new Movie({ title, year, genre, director });

    try {
        await newMovie.save();
        res.send("Movie added successfully: " + title);
    } catch (error) {
        console.error("Error adding movie:", error.message);
        res.status(500).send("Error adding movie");
    }
});

// PUT route to update a movie by ID
app.put("/api/update/:id", async function (req, res) {
    const { id } = req.params;
    const { title, year, genre, director } = req.body;

    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            id,
            { title, year, genre, director },
            { new: true, runValidators: true }
        );

        if (updatedMovie) {
            res.send("Movie updated successfully");
        } else {
            res.status(404).send("Movie not found");
        }
    } catch (error) {
        console.error("Error updating movie:", error.message);
        res.status(500).send("Error updating movie");
    }
});

// DELETE route to delete a movie by ID
app.delete("/api/delete/:id", async function (req, res) {
    const { id } = req.params;

    try {
        const deletedMovie = await Movie.findByIdAndDelete(id);
        if (deletedMovie) {
            res.send("Movie deleted successfully");
        } else {
            res.status(404).send("Movie not found");
        }
    } catch (error) {
        console.error("Error deleting movie:", error.message);
        res.status(500).send("Error deleting movie");
    }
});

app.get("*", function (req, res) {
    res.send("Error! No such path!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
