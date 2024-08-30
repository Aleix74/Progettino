const express = require("express");
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

// app.use(cors({
//   origin: 'http://127.0.0.1:5500', // Cambia in base alla tua configurazione
//   credentials: true
// }));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parsing dei dati del form
app.use(bodyParser.json({ limit: "50mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Cambia a true se usi HTTPS
      sameSite: "lax", // Politica di SameSite per prevenire CSRF
    },
  })
);

app.set("view engine", "ejs");
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname, "public", "progettino.html");
});

app.get("/users/register", (req, res) => {
  res.render("register");
});

app.get("/users/login", (req, res) => {
  res.render("login", { success: false });
});

app.get("/users/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // req.flash("success_msg", "Hai effettuato il log out");
    res.redirect("http://localhost:4000/progettino.html");
  });
});

app.post("/users/register", async (req, res) => {
  let { NomeHotel, Citta, Via, Email, Password } = req.body;

  console.log({
    NomeHotel,
    Citta,
    Via,
    Email,
    Password,
  });

  let errors = [];

  if (!NomeHotel || !Citta || !Via || !Email || !Password) {
    errors.push({ message: "Inserisci tutti i campi" });
  }

  if (Password && Password.length < 6) {
    errors.push({
      message: "La password deve essere lunga almeno 6 caratteri",
    });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    //La convalida del form è stata superata
    let hashedPassword = await bcrypt.hash(Password, 10);
    console.log(hashedPassword);

    pool.query(
      "SELECT * FROM hotel WHERE email = $1",
      [Email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "Email già registrata" });
          res.render("register", { errors });
        } else {
          pool.query(
            `INSERT INTO hotel (nome_hotel, citta, via, email, password) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING id, password`,
            [NomeHotel, Citta, Via, Email, hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash(
                "success_msg",
                "Ora sei registrato. Puoi effettuare il log in"
              );
              res.redirect("/users/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    // Se l'autenticazione è stata eseguita con successo
    res.render("login", {
      user: req.user,
      success: true,
    });
  }
);

app.get("/quiz", checkAuthenticated, (req, res) => {
  // var user = req.user;
  res.render("quiz", { user: req.user });
});

// let logFlag = false;

// app.post("/submit", (req, res) => {
//   //Store form data in session
//   // console.dir(req.body);
//   // req.session.formData = req.body;
//   // req.session.score = parseInt(req.body.score) || 0;
//   // const score = req.body.score ? parseInt(req.body.score) : 0;
//   // req.session.score = score;
//   if (req.body.score != undefined && req.body.score != null) {
//     req.session.score = parseInt(req.body.score);
//   } else {
//     req.session.score = 0;
//   }
//   // if (!req.session.score) {
//   //   req.session.score = score;
//   // }
//   // if (!logFlag) {
//   console.log("Punteggio salvato nella sessione:", req.session.score);
//   // logFlag = true;
//   // }
//   // console.log('Dati salvati nella sessione:', req.session.formData); // Log per verificare i dati salvati
//   //Redirect to the second route
//   res.redirect("/esito");
//   // score = req.body.score;
//   // console.log('Punteggio ricevuto:', score); // Log per verificare il punteggio
//   // score = req.body.score;
//   //  res.status(200).send();
// });

// let logFlag1 = false;

// app.get("/esito", checkAuthenticated, (req, res) => {
//   console.log( "Punteggio salvato nella sessione (prima del rendering):", req.session.score);
//   if (req.body.score != undefined && req.body.score != null) {
//     req.session.score = parseInt(req.body.score);
//     console.log("Punteggio inviato a esito:", req.session.score);
//   } else {
//     req.session.score = 0;
//   } // if (!logFlag1) {
//   // logFlag1 = true;
//   // }
//   res.render("esito", { score: req.session.score });
// });

app.post("/submit", (req, res) => {
  if (req.body.score !== undefined && req.body.score !== null) {
    req.session.score = parseInt(req.body.score);
  }
  
  console.log("Punteggio salvato nella sessione:", req.session.score);
  res.redirect("/esito");
});


app.get("/esito", checkAuthenticated, (req, res) => {
  console.log("Punteggio salvato nella sessione (prima del rendering):", req.session.score);
  
  // Non c'è bisogno di fare il reset qui.
  
  console.log("Punteggio inviato a esito:", req.session.score);
  res.render("esito", { score: req.session.score });
});


app.post("/resetScore", (req, res) => {
  req.session.score = 0; // Reset the score
  res.status(200).send("Score reset"); // Respond with success
});

app.post("/saveScore", checkAuthenticated, (req, res) => {
  const userId = req.user.id;
  const score = req.body.score;
  let query;
  let values;

  if (req.user.type === "hotel") {
    // Se l'utente è un hotel
    query = `
      INSERT INTO quiz (hotel_id, super_user_id, punteggio) 
      VALUES ($1, NULL, $2) 
      ON CONFLICT (hotel_id, super_user_id) 
      DO UPDATE SET punteggio = EXCLUDED.punteggio
    `;
    values = [userId, score];
  } else if (req.user.type === "super_user") {
    // Se l'utente è un super_user
    query = `
      INSERT INTO quiz (hotel_id, super_user_id, punteggio) 
      VALUES (NULL, $1, $2) 
      ON CONFLICT (hotel_id, super_user_id) 
      DO UPDATE SET punteggio = EXCLUDED.punteggio
    `;
    values = [userId, score];
  } else {
    // Tipo utente non riconosciuto
    return res.status(400).json({ error: "Tipo di utente non valido" });
  }

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error(
        "Errore durante l'inserimento del punteggio nel database:",
        err
      );
      res.status(500).json({ error: "Errore del server" });
    } else {
      res.status(200).json({ message: "Punteggio salvato con successo" });
    }
  });
});

app.get("/quizResults", checkAuthenticated, (req, res) => {
  if (req.user.type !== "super_user") {
    return res.status(403).send("Accesso negato");
  }

  pool.query(
    `SELECT q.*, h.nome_hotel 
     FROM quiz q
     LEFT JOIN hotel h ON q.hotel_id = h.id`,
    (err, results) => {
      if (err) {
        console.error("Errore nel recupero dei risultati dei quiz:", err);
        return res.status(500).send("Errore del server");
      }
      res.render("quizResults", { results: results.rows });
    }
  );
});

app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      userType: req.user.type,
      username: req.user.email, // o un altro campo identificativo
    });
  } else {
    res.status(401).json({ error: "Non autenticato" });
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/users/login");
  }
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

const initializePaspport = require("./passportConfig");

initializePaspport(passport);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server sta eseguendo nella porta ${PORT}`);
});



// app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
//   // console.log("ciao" + JSON.stringify(req.user));
//   req.session.userType = req.user.type;
//   res.render("dashboard", { user: req.user });
// });
// app.post('/users/login', (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//       if (err) {
//           return next(err);
//       }
//       if (!user) {
//           return res.status(401).render('login', { error: 'Credenziali non valide' });
//       }
//       req.logIn(user, (err) => {
//           if (err) {
//               return next(err);
//           }
//           // Autenticazione riuscita, rendiamo la pagina di login con messaggio di benvenuto e reindirizzamento
//           return res.render('login', { user });
//       });
//   })(req, res, next);
// });

//const crypto = require('crypto');
//const cors = require('cors');
//const cookieParser = require('cookie-parser');
//app.use(cookieParser());

// app.get('/api/user', (req, res) => {
//   console.log("ciao");
//   console.log(req.session);
//   if (req.isAuthenticated()) {
//     console.log('User authenticated:', req.user);
//     const userData = req.cookies.userData; // Assumendo che tu usi il middleware per la decrittografia dei cookie
//     if (!userData) {
//       return res.status(401).json({ error: 'User sus' });
//     }
//     res.json({ userType: userData.userType });
//   } else {
//     res.status(401).json({ error: 'User sus' });
//   }
// });

// (req, res) => {
//   const user = req.user;
//   res.setEncryptedCookie('userData', { userType: user.type, username: user.username }, { httpOnly: true, secure: false, sameSite: 'lax' });
// res.redirect("/users/dashboard");
// // Funzione per crittografare i dati
// function encrypt(text) {
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SESSION_SECRET, 'hex'), Buffer.from(process.env.IV, 'hex'));
//   let encrypted = cipher.update(text);
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return encrypted.toString('hex');
// }

// // Funzione per decrittografare i dati
// function decrypt(text) {
//   const encryptedText = Buffer.from(text, 'hex');
//   const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.SESSION_SECRET, 'hex'), Buffer.from(process.env.IV, 'hex'));
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// }

// // Middleware per crittografare i dati utente nei cookie
// app.use((req, res, next) => {
//   res.setEncryptedCookie = (name, value, options) => {
//     if (name != 'connect.sid'){
//       const encryptedValue = encrypt(JSON.stringify(value));
//       res.cookie(name, encryptedValue, options);
//     } else {
//       res.cookie(name, value, options);
//     }
//   };

//   next();
// });

// // Middleware per decrittografare i cookie
// app.use((req, res, next) => {
//   if (req.cookies) {
//     for (const [name, value] of Object.entries(req.cookies)) {
//       if (name !== 'connect.sid') {  // Escludi il cookie di sessione
//         try {
//           req.cookies[name] = JSON.parse(decrypt(value));
//         } catch (err) {
//             console.error(`Failed to decrypt cookie ${name}:`, err);
//           }
//       }
//     }
//   }
//   next();
// });

// app.get('/api/user', (req, res) => {

//   const userData = req.cookies.userData; // Dati decrittografati automaticamente dal middleware

//   if (!userData) {
//       return res.status(401).json({ error: 'User not authenticated' });
//   }

//   res.json({ userType: userData.userType }); // Restituisce solo il campo userType
// });
// app.get('/api/user', (req, res) => {
//   if (req.isAuthenticated()) {
//       res.json({ userType: req.user.type }); // Assumi che req.user.type sia disponibile
//   } else {
//       res.status(401).json({ error: 'Unauthorized' });
//   }
// });
// app.post(
//   "/users/login",
//   passport.authenticate("local", {
//     successRedirect: "/users/dashboard",
//     failureRedirect: "/users/login",
//     failureFlash: true,
//   })
// );
// // Middleware per crittografare i cookie
// app.use((req, res, next) => {
//   const originalSend = res.cookie;

//   res.cookie = (name, value, options) => {
//     const encryptedValue = encrypt(JSON.stringify(value)); // Cripta l'intero contenuto del cookie
//     originalSend.call(res, name, encryptedValue, options);
//   };

//   next();
// });
// (req, res) => {
//   // Imposta un cookie per identificare il tipo di utente
//   res.cookie('userType', req.user.type, {
//     httpOnly: true, // Rende il cookie accessibile solo al server
//     secure: false,  // Cambia a true se usi HTTPS
//     sameSite: 'Lax', // Impedisce l'invio del cookie tra domini diversi
//   });
//   res.redirect('/users/dashboard');
// (req, res) => {
//   // Imposta il cookie userType dopo un login riuscito
//   res.cookie('userType', req.user.type, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false });
//   res.redirect('/users/dashboard');
// });
// app.use(session({
//   store: new pgSession({
//     pool: pool,
//     tableName: 'session',
//   }),
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: false, // false dato che non sto utilizzando https
//     sameSite: 'None', // Permette l'invio di cookie tra domini e porte diverse
//     //Se imposti il flag SameSite del cookie a Strict, il cookie verrà inviato solo con richieste provenienti dallo stesso dominio. Tuttavia, se è impostato su Lax o None, il cookie verrà inviato anche in contesti cross-origin
//   },
// }));
// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey)
//node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" da terminale
//node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
// app.post('/users/login', (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     if (err) {
//       return next(err); // Gestisce eventuali errori di autenticazione
//     }

//     if (!user) {
//       // Se l'autenticazione fallisce, restituisce un messaggio di errore personalizzato
//       return res.status(401).json({ message: info.message || 'Login fallito.' });
//     }

//     // Se l'autenticazione è avvenuta con successo, genera un JWT
//     const payload = {
//       id: user.id,
//       email: user.email,
//       type: user.type
//     };
//     const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

//     // Restituisce il token al client
//     res.json({ token, message: 'Login riuscito, benvenuto!' });
//   })(req, res, next);
// });
// app.post(
//   "/users/login",
//   passport.authenticate("local", {
//     successRedirect: "/users/dashboard",
//     failureRedirect: "/users/login",
//     failureFlash: true,
//   })
// );

// (req, res) => {
//   // Imposta un cookie per identificare il tipo di utente
//   res.cookie('userType', req.user.type, {
//     httpOnly: true, // Rende il cookie accessibile solo al server
//     secure: false,  // Cambia a true se usi HTTPS
//     sameSite: 'Lax', // Impedisce l'invio del cookie tra domini diversi
//   });
//   res.redirect('/users/dashboard');
// (req, res) => {
//   // Imposta il cookie userType dopo un login riuscito
//   res.cookie('userType', req.user.type, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false });
//   res.redirect('/users/dashboard');
// });

// app.use(express.static(path.join(__dirname, 'Programmazione web')));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// const bodyParser = require('body-parser')
// require("dotenv").config()
// const path = require('path');
// app.get("/quiz", checkAuthenticated, (req, res) => {
//     res.render("quiz");
// });
// app.post('/submit-quiz', checkAuthenticated, (req, res) => {
//     console.dir(req.body)
// const score  = req.body;
// const userId = req.user.id;  // Assume che l'ID utente sia memorizzato in req.user.id

// pool.query(
//     `INSERT INTO quiz (hotel_id, punteggio) VALUES ($1, $2) ON CONFLICT (hotel_id)
//      DO UPDATE SET punteggio = EXCLUDED.punteggio`,//ON CONFLICT (hotel_id) DO UPDATE per gestire il caso in cui il hotel_id esista già nella tabella. In tal caso, il punteggio viene aggiornato.
//     [userId, score],
//     (err, results) => {
//         if (err) {
//             console.error('Errore durante l\'inserimento del punteggio nel database:', err);
//             res.status(500).json({ error: 'Errore del server' });
//         } else {
//             res.status(200).send("Punteggio salvato con successo");
//         }
//     }
// );
// });

// app.get("/esito", (res,req)=> {
//     const score = req.query;
//     console.dir(req.query)
// });
// app.get('/submit-quiz', (req, res) => {
//     const score = req.query.score;
//     console.log('Received score:', score);
//     // Do something with the score, e.g., store it in a database
//     res.json({ success: true, score: score });
//   });

// Una volta autenticato, non riesco a passare i dati nella tabella di postegres quiz con i campi id(chiave esterna della tabella hotel) e punteggio associato a quell'utente
// Super user, l'idea che vado direttamente nella sezione login e inserendo email e password da admin riesco ad accedere
// al quiz visualizzando i punteggi associati a ogni risposta (mo che ci penso deve essere già memorizzato nel database pefforza, anche perchè se svolgo
// il quiz da admin va a finire nella tabella quiz con id 1 e il suo punteggio)

// la terza meno importante, cliccare sul tasto prova quiz e se NON sei autenticato NON posso visualizzare il quiz
//(all'esame faccio mossa del giaguaro antico e mi loggo direttamente cercando di evitare questa situazione hihihi il + brv)

// app.post('/saveScore', checkAuthenticated, (req, res) => {
//   const userId = req.user.id; // Assumendo che user.id sia l'identificativo dell'hotel
//   const score = req.body.score;
//   const userType = req.user.type;

//   const column = userType === 'hotel' ? 'hotel_id' : 'super_user_id';

//   pool.query(
//     // `INSERT INTO quiz (hotel_id, punteggio)
//     //  VALUES ($1, $2)
//     //  ON CONFLICT (hotel_id)
//     //  DO UPDATE SET punteggio = EXCLUDED.punteggio`,
//     `INSERT INTO quiz (${column}, punteggio)
//      VALUES ($1, $2)
//      ON CONFLICT (${column})
//      DO UPDATE SET punteggio = EXCLUDED.punteggio`,
//     [userId, score],
//     (err, results) => {
//       if (err) {
//         console.error('Errore durante l\'inserimento del punteggio nel database:', err);
//         res.status(500).json({ error: 'Errore del server' });
//       } else {
//         res.status(200).json({ message: 'Punteggio salvato con successo' });
//       }
//     }
//   );
// });
