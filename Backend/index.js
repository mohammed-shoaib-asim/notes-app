require('dotenv').config();
const { connectionString } = require('./config.json');
const { connect } = require('mongoose');
const User = require('./models/user.model');
const Note = require('./models/note.model');
const { sign } = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "*",
}));

connect(connectionString);

// Check if the backend is responding to the frontend
app.get("/", (req, res) => {
    console.log("Backend received a request at the root endpoint.");
    res.json({ data: "hello shoaib asim" });
});

app.post("/", (req, res) => {
    console.log("POST request received at the root endpoint.");
    res.json({ data: "hello post" });
});

// Backend ready!!!

// Create account
app.post("/create-account", async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname) {
        return res.status(400).json({ error: "fullname is required" });
    }
    if (!email) {
        return res.status(400).json({ error: "email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: "password is required" });
    }

    const isUser = await User.findOne({ email: email });
    if (isUser) {
        return res.json({ error: "User already exists" });
    }

    const user = new User({
        fullname,
        email,
        password
    });
    await user.save();

    const accessToken = sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3600m",
    });

    console.log(`User created: ${email}`);
    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration successful",
    });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "password is required" });
    }

    const userInfo = await User.findOne({ email: email });
    if (!userInfo || userInfo.password !== password) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = { user: userInfo };
    const accessToken = sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3600m",
    });

    console.log(`User logged in: ${email}`);
    return res.json({
        error: false,
        message: "Login successful",
        email,
        accessToken,
    });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });
    if (!isUser) {
        return res.sendStatus(401);
    }
    return res.json({
        user: { fullname: isUser.fullName, email: isUser.email, _id: isUser._id, createdOn: isUser.createdOn },
        message: "User retrieved successfully",
    });
});

// Add note
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title) {
        return res.status(400).json({ error: true, message: "Title is required" });
    }
    if (!content) {
        return res.status(400).json({ error: true, message: "Content is required" });
    }

    try {
        const note = new Note({
            title,
            content,
            tags,
            userId: user._id,
        });

        await note.save();
        console.log("Note added:", note);
        return res.json({
            error: false,
            message: "Note added successfully",
            note,
        });
    } catch (err) {
        console.error("Error adding note:", err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// Edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

        await note.save();
        return res.json({
            error: false,
            message: "Note updated successfully",
            note,
        });
    } catch (err) {
        console.error("Error updating note:", err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// Get all notes
app.get("/get-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
        return res.json({
            error: false,
            message: "All notes retrieved successfully",
            notes,
        });
    } catch (err) {
        console.error("Error retrieving notes:", err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// Delete note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        await note.deleteOne();
        return res.json({
            error: false,
            message: "Note deleted successfully",
        });
    } catch (err) {
        console.error("Error deleting note:", err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// Update isPinned
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { isPinned } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        note.isPinned = isPinned || false;
        await note.save();
        return res.json({
            error: false,
            message: "Note updated successfully",
            note,
        });
    } catch (err) {
        console.error("Error updating pinned status:", err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// Search notes
app.get("/search-notes", authenticateToken, async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: true, message: "Search query is required" });
    }

    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        });
        return res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes retrieved successfully",
        });
    } catch (err) {
        console.error("Error searching notes:", err);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});

module.exports = app;
