const express = require("express");
const connectDB = require("./db");  
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const Intern = require("./models/Intern");
const Mentor = require("./models/Mentor");
const Certificate = require("./models/Certificate");

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));

connectDB();

const SECRET_KEY = "your_secret_key"; 

// **Register Route**
app.post("/register", async (req, res) => {
    try {
        const { role, email, password } = req.body;
        if (!role || !email || !password) return res.status(400).json({ message: "All fields are required" });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ role, email, password });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// **Login Route**
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// **Protected Route Example**
app.get("/dashboard", (req, res) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        res.json({ message: `Welcome ${verified.role}` });
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
});

app.post("/add-student", async (req, res) => {
    try {
        const intern = new Intern(req.body);
        await intern.save();
        res.status(201).json({ message: "Intern added successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get Mentors
app.get("/mentors", async (req, res) => {
    try {
        const mentors = await User.find({ role: "Mentor" }, "_id email"); // Fetch ID and Name
        res.json(mentors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching mentors", error });
    }
});

// Assign Mentor to Intern
app.post("/assign-mentor", async (req, res) => {
    try {
        const { internId, mentorId } = req.body;

        // Find the intern and update mentor ID
        const intern = await Intern.findByIdAndUpdate(internId, { mentor: mentorId }, { new: true });

        if (!intern) {
            return res.status(404).json({ message: "Intern not found" });
        }

        res.json({ message: "Mentor assigned successfully", intern });
    } catch (error) {
        res.status(500).json({ message: "Error assigning mentor", error });
    }
});


// Remove Intern
app.delete("/remove-student/:aadhar", async (req, res) => {
    try {
        const deletedIntern = await Intern.findOneAndDelete({ aadhar: req.params.aadhar });
        if (deletedIntern) res.json({ message: "Intern removed successfully!" });
        else res.status(404).json({ message: "Intern not found!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Internship Requests (List of Interns)
app.get("/interns", async (req, res) => {
    try {
        const internName = req.query.name; // Get the intern name from the request query

        let interns;
        if (internName) {
            interns = await Intern.find({ name: { $regex: new RegExp(`^${internName}$`, "i") } }); 
            // Case-insensitive exact match
        } else {
            interns = await Intern.find(); // Return all interns if no name is provided
        }

        if (interns.length === 0) {
            return res.status(404).json({ error: "No intern found with this name." });
        }

        res.json(interns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Nodemailer Config
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password' 
    }
});

app.get("/mentor-interns/:mentorId", async (req, res) => {
    try {
        const mentorId = req.params.mentorId;  // Get mentorId from URL params
        const interns = await Intern.find({ mentorId });  // Find all interns assigned to this mentor
        res.json(interns);  // Send back the list of interns
    } catch (error) {
        res.status(500).json({ message: "Error fetching interns for mentor", error });
    }
});

// Logout (Dummy API)
app.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));

app.put("/update-intern-status", async (req, res) => {
    try {
        const { name, status } = req.body;

        const intern = await Intern.findOneAndUpdate({ name }, { status }, { new: true });

        if (!intern) {
            return res.status(404).json({ message: "Intern not found" });
        }

        res.json({ message: `Status of ${name} updated successfully!` });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Server error" });
    }
});


