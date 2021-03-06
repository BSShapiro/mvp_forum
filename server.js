require("dotenv").config();
const express = require("express");
const db = require("./db/conn.js");
const app = express();
const client = require("pg/lib/native/client");
const moment = require("moment");
const cors = require("cors");

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.static("public"));

app.post("/api/login", async (req, res) => {
    let worked;
    let data;
    try{
        data = await db.query(`SELECT * FROM profile WHERE user_name = '${req.body.user_name}';`);
        worked = true;
        console.log(data.rows);
    }catch(err){
        console.error(err);
        worked = false;
    }
    if(data.rows.length === 0){
        res.json('Account does not exist, please make a new account.');
    } else if(data.rows[0].password !== req.body.password){
        res.json('Password is incorrect.');
    } else if(data.rows[0].password === req.body.password && worked === true){
        res.json(data.rows[0]);
    } else if(worked === false){
        res.status(500).json('An error has occured.');
    }
});

app.post("/api/create", async (req, res) => {
    let worked;
    let data;
    try{
        data = await db.query(`SELECT * FROM profile WHERE user_name = '${req.body.user_name}';`)
    } catch(err){
        console.error(err);
    }
    if(data.rows.length === 0){
        try{
            await db.query(`INSERT INTO profile(user_name, password) VALUES ('${req.body.user_name}', '${req.body.password}');`);
            data = await db.query(`SELECT * FROM profile WHERE user_name = '${req.body.user_name}'`);
            worked = true;
        } catch(err){
            console.error(err);
            worked = false;
        }
        if(worked === true){
            res.json(data.rows[0])
        } else if(worked === false){
            res.status(500).json('An error has occured.')
        }
    } else if(data.rows.length > 0){
        res.json('Username already exists, please enter a new username.')
    }
})

app.post("/api/post", async (req, res) => {
    let worked;
    let data;
    let date = moment().format('yyyy-MM-DD HH:mm:ss');
    try{
        await db.query(`INSERT INTO posts_all(post, date, user_id) VALUES ('${req.body.post}', '${date}', ${req.body.user_id});`);
        data = await db.query(`SELECT * FROM posts_all WHERE date = '${date}';`);
        worked = true;
    }catch(err){
        console.error(err);
        worked = false;
    }
    if(worked === true){
        res.json(data.rows[0]);
    } else if(worked === false){
        res.status(500).json('An error has occured.');
    }
})

app.get("/api/posts", async (req, res) => {
    let worked;
    let data;
    try{
        data = await db.query('SELECT posts_all.post, posts_all.date, posts_all.user_id, posts_all.id, profile.user_name FROM posts_all INNER JOIN profile ON posts_all.user_id=profile.id ORDER BY date DESC;');
        for(let i = 0; i < data.rows.length; i++){
            data.rows[i].date = moment(data.rows[i].date).local().format("YYYY-MM-DD HH:mm");
        }

        worked = true;
    } catch(err){
        console.error(err);
        worked = false;
    }
    if(worked === true){
        res.json(data.rows);
    } else if(worked === false){
        res.status(500).json('An error has occured.');
    }
})

app.get("/api/posts/:id", async(req, res) => {
    let data;
    let worked;
    try{
        data = await db.query(`SELECT posts_all.post, posts_all.date, posts_all.user_id, posts_all.id, profile.user_name FROM posts_all INNER JOIN profile ON posts_all.user_id=profile.id WHERE user_id = ${req.params.id} ORDER BY date DESC;`)
        for(let i = 0; i < data.rows.length; i++){
            data.rows[i].date = moment(data.rows[i].date).local().format("YYYY-MM-DD HH:mm");
        }
        worked = true;
    } catch(err){
        console.error(err);
        worked = false;
    }
    if(worked === true){
        res.json(data.rows);
    } else if(worked === false){
        res.json('An error has occured.')
    }
})

app.patch('/api/posts/:id', async (req, res) => {
    try{
        await db.query(`UPDATE posts_all SET post = '${req.body.post}' WHERE id = ${req.params.id};`)
    } catch (err){
        console.error(err);
    }
})

app.delete('/api/post/:id', async (req, res) =>{
    try{
        await db.query(`DELETE FROM posts_all WHERE id = ${req.params.id}`,)
        res.json('Deleted')
    } catch(err){
        console.error(err);
        res.status(500).json('An error has occurred.')
    }
})

app.listen(PORT, () => {
  console.log(`listening on Port ${PORT}`);
});