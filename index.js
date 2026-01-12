const express=require("express");
const cors=require("cors");
const bodyParser=require('body-parser')
const bcrypt=require('bcrypt')
const app=express();
app.use(cors({orgin:"*"}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
const mysql=require('mysql2')




const db=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'2001',
    database:'backend_server',
    port:3306,
    connectionLimit:10
});


// db connection
db.getConnection((err,connection)=>{
    if(err){
        console.log("error connecting to database",err);
        return;
    }
    console.log("database connected")
})


// register route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (username, passwordHashed) VALUES (?, ?)',
            [username, hashedPassword],
            (err, result) => {
                if (err) {
                    console.error('Error inserting values:', err);
                    return res.status(500).send('Database error');
                }

                console.log('Registered successfully');
                console.log(`username:${username},password:${hashedPassword}`)
                res.status(201).send({enterd_username:username,enterd_password:password,hashed_password:hashedPassword});
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ✅ Check input
    if (!username || !password) {
      return res.status(400).send("Username and password required");
    }

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, results) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).send("Server error");
        }

        if (results.length === 0) {
          return res.status(400).send("User not found");
        }

        const user = results[0];

        // ✅ Correct column name
        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHashed
        );

        if (!isPasswordValid) {
          return res.status(401).send("Invalid password");
        }

        // ✅ Login success
        res.send("Login successful");
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
});

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Database error');
        }

        // 🔹 Output in VS Code terminal
        console.log('Users from database:');
        console.table(results); // best for readable output

        // 🔹 Send response to browser/Postman
        res.status(200).json(results);
    });
});



//delete route

app.delete("/delete/:username", (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  db.query(
    "DELETE FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        console.error("Error deleting user:", err);
        return res.status(500).send("Server error");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("User not found");
      }

      res.send(`User '${username}' deleted successfully`);
    }
  );
});


//delete multiple users at a time
app.delete("/users/by-username", (req, res) => {
  const { usernames } = req.body;

  if (!Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).send("Provide usernames array");
  }

  const query = `DELETE FROM users WHERE username IN (?)`;

  db.query(query, [usernames], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting users");
    }

    res.send(`${result.affectedRows} users deleted`);
  });
});





app.get('/',(req,res)=>{
            
        console.log("degault route 3000 port")
            
        });
app.delete('/delete',(req,res)=>{

})








app.listen(3000,()=>{
    console.log("serever is running at port 3000")
})