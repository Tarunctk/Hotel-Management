const pool = require("../db/db");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //checking that all fileds are filled or not
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    //check if the email is already exist or not
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //insert the date into table
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    //compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //set cookie
    res.cookie("userId", user.id,{
        httpOnly: true,
        secure: true,
        sameSite: "None",
       });

    res.json({
       message: "Login successful",
       id: user.id,
       email: user.email,
       role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}; 