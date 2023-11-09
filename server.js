const express = require("express");
var favicon = require("serve-favicon");
var path = require("path");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mysql = require("mysql2");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

const url = process.env.MONGO_DB_URL || `mongodb+srv://kamalsingh:<${process.env.MONGODB_PASSWORD}>@cluster0.baambk7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(url);

const DB_NAME = process.env.DB_NAME || "brewVerse";
const DB_COLLECTION_NAME = process.env.DB_COLLECTION_NAME || "userData";
const db = client.db(DB_NAME);
const coll = db.collection(DB_COLLECTION_NAME);

var con = mysql.createConnection({
  host: "sql12.freemysqlhosting.net",
  user: "sql12660423",
  password: "LLmXcGLFZB",
  port: 3306,

});

con.connect(function (err) {
  if (err) throw err;
  console.log("Database connected!");
  con.query("use `sql12660423`;", function (err, result, fields) {
    if (err) throw err;
  });
});

const app = express();
const dataStream = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use(favicon("public\\favicon.ico"));

app.use(
  session({
    secret: "f95d4b0b7a51ecc4a0cb783931ce59319777981a8ff760c7eeebd1014d7f7154",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow sending cookies from frontend to backend
  })
);
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get("/", (req, res) => {
  if (req.session.user) {
    req.session.cookie.expires = new Date(Date.now() + 3600000); // 1 hour in milliseconds
    req.session.cookie.maxAge = 3600000; // Update maxAge accordingly
    console.log("LOGGED IN Welcome back,", req.session.user, " , showing Dashboard...");
    res.redirect("/dashboard");
  } else {
    res.render("index");
  }
});

app.get("/login", (req, res) => {
  res.redirect("/");
});
app.post("/login", urlencodedParser, (req, res) => {
  con.query(`Select username, pass from users where username = '${req.body.username}';`, (err, result) => {
    if (err) {
      res.render("index", { errStr: "Invalid Username or password... Try again." });
    } else {
      if (result.length > 0) {
        bcrypt.compare(req.body.password, result[0]["pass"], (err, cryptRes) => {
          if (err) throw err;
          if (cryptRes) {
            req.session.user = result[0]["username"];
            res.redirect("/dashboard");
          } else {
            res.render("index", { errStr: "Invalid Username or password... Try again." });
          }
        });
      } else {
        res.render("index", { errStr: "Invalid Username or password... Try again." });
      }
    }
  });
});

app.post("/signup", urlencodedParser, (req, res) => {
  bcrypt.hash(req.body.password, saltRounds).then((hash) => {
    con.query(
      `insert into users (username, pass, fullname, email, isActive, isSubscribed, availableApi) values ('${req.body.username}', '${hash}', '${req.body.fullname}', '${req.body.email}', 1, 0, 3);`,
      (err) => {
        if (err) {
          console.log("User Exists, ERROR: ", err);
          res.render("index", { errStr: "Username already exists. Please Try a different username." });
        } else {
          req.session.user = req.body.username;
          res.redirect("/dashboard");
        }
      }
    );
  });
});

app.post("/toggleApi", urlencodedParser, (req, res) => {
  if (req.session.user) {
    con.query(`UPDATE apikeys SET isActive = ${req.body.state} where apiName = '${req.body.apiname}';`, (err) => {
      if (err) throw err;
      res.statusCode = 200;
    });
  }
});

app.post("/brewSearch", urlencodedParser, (req, res) => {
  let response = {};
  if (req.session.user) {
    fetch(`https://api.openbrewerydb.org/v1/breweries?${req.body.searchBy}=${req.body.searchTerm}&per_page=12`, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        response = data;
        response.forEach((brew) => {
          brew["rating"] = Math.round(Math.random() * (5 - 2) + 2);
        });
        res.send(response);
      });
  }
});

app.post("/userFeedBack", urlencodedParser, (req, res) => {
  if (req.session.user) {
    coll
      .updateOne(
        { id: req.body.breweryid },
        { $push: { ratings: { user: req.body.user, comment: req.body.comment, rating: req.body.rating } } },
        { upsert: true }
      )
      .then(() => {
        console.log("Inserted.");
      });
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { username: req.session.user, availableApi: "3" });
  } else {
    res.redirect("/");
  }
});

app.post("/newApi", urlencodedParser, (req, res) => {
  if (req.session.user) {
    con.query(
      `insert into apikeys (username, apiName, apikey, isActive) values ('${req.session.user}','${
        req.body.newapiname
      }', '${uuidv4()}', 1);`,
      (err) => {
        if (err) {
          res.render("dashboard", {
            username: req.session.user,
            apiErr: 1,
          });
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/deleteApi", urlencodedParser, (req, res) => {
  if (req.session.user) {
    con.query(
      `delete from apikeys where username = '${req.session.user}' and apiName = '${req.body.apiname}';`,
      (err) => {
        if (err) throw err;
      }
    );
  }
  res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
  if (req.session.user) {
    req.session.user = "";
    res.redirect("/");
  } else res.redirect("/");
});

app.post("/brewSearch", urlencodedParser, (req, res) => {
  let response = {};
  if (req.session.user) {
    fetch(`https://api.openbrewerydb.org/v1/breweries?by_city=${req.body.searchTerm}&per_page=10`, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        response = data;
        response.forEach((brew) => {
          brew["rating"] = Math.round(Math.random() * (5 - 2) + 2);
        });
        res.send(response);
      });
  }
});

app.get("/:id", (req, res) => {
  if (req.session.user) {
    fetch(`https://api.openbrewerydb.org/v1/breweries?by_ids=${req.params.id}`, {
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        coll.findOne({ id: data[0]["id"] }).then((result) => {
          if (result != null || result != undefined) {
            res.render("brewView", { details: data[0], username: req.session.user, reviews: result });
          }else{
            res.render("brewView", { details: data[0], username: req.session.user, reviews: result });
          }
        });
      });
  } else {
    res.render("index");
  }
});

app.use((req, res) => {
  res.status(404);
  res.render("error"); // Render the error page
});

app.listen(3000, () => {
  console.log("Listening FRONT END on port 3000, http://localhost:3000");
});
