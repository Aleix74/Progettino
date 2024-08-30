const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        // Verifica se l'utente è un hotel
        pool.query(
            `SELECT * FROM hotel WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                if (results.rows.length > 0) {
                    const user = results.rows[0];
                    user.type = 'hotel';
                    return checkPassword(user, password, done);
                } else {
                    // Se non è un hotel, verifica se è un super_user
                    pool.query(
                        `SELECT * FROM super_user WHERE email = $1`,
                        [email],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            if (results.rows.length > 0) {
                                const user = results.rows[0];
                                user.type = 'super_user';
                                return checkPassword(user, password, done);
                            } else {
                                return done(null, false, { message: "Email non registrata" });
                            }
                        }
                    );
                }
            }
        );
    };

    const checkPassword = (user, password, done) => {
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: "La password non è corretta" });
            }
        });
    };

    passport.use(
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
            },
            authenticateUser
        )
    );

    // passport.serializeUser((user, done) => done(null, user.id));
    passport.serializeUser((user, done) => done(null, { id: user.id, type: user.type }));

    passport.deserializeUser((obj, done) => {
        const table = obj.type === 'hotel' ? 'hotel' : 'super_user';
        pool.query(`SELECT * FROM ${table} WHERE id = $1`, [obj.id], (err, results) => {
            if (err) {
                return done(err);
            }
            if (results.rows.length > 0) {
                const user = results.rows[0];
                user.type = obj.type; // Riaggiungi il tipo di utente
                return done(null, user);
            } else {
                return done(new Error("Utente non trovato"));
            }
        });
    });
}

module.exports = initialize;

// const LocalStrategy = require("passport-local").Strategy;
// const { pool } = require("./dbConfig");
// const bcrypt = require("bcrypt");

// function initialize(passport) {
//     const autheticateUser = (email, password, done) => {
//         pool.query(
//             `SELECT * FROM hotel WHERE email = $1`,
//             [email], 
//             (err, results) => {
//                 if (err) {
//                     throw err;
//                 }
//                 console.log(results.rows);

//                 if (results.rows.length > 0) {
//                     const user = results.rows[0];

//                     bcrypt.compare(password, user.password, (err, isMatch) => {
//                         if (err) {
//                             throw err;
//                         }

//                         if (isMatch) {
//                             return done(null, user);
//                         } else {
//                             return done(null, false, { message: "La password non è corretta" });
//                         }
//                     });
//                 } else {
//                     return done(null, false, { message: "Email non registrata" });
//                 }
//             }
//         );
//     };

//     passport.use(
//         new LocalStrategy(
//             {
//                 usernameField: "email",
//                 passwordField: "password",
//             },
//             autheticateUser
//         )
//     );

//     passport.serializeUser((user, done) => done(null, user.id));

//     passport.deserializeUser((id, done) => {
//         pool.query(`SELECT * FROM hotel WHERE id = $1`, [id], (err, results) => {
//             if (err) {
//                 throw err;
//             }
//             return done(null, results.rows[0]);
//         });
//     });
// }

// module.exports = initialize;
// const LocalStrategy = require("passport-local").Strategy;
// const { Strategy } = require("passport-local");
// const { pool } = require("./dbConfig");
// const bcrypt = require("bcrypt");

// function inizialize(passport){
// const autheticateUser = (email, password, done)=>{
//     pool.query(
//         `SELECT * FROM hotel WHERE email = $1`, 
//         [Email], 
//         (err, results)=>{
//             if (err){
//                 throw err;
//             }
//             console.log(results.rows)

//             if(results.rows.length > 0){
//                 const user = results.rows[0];

//                 bcrypt.compare(password, user.password, (err, isMatch)=>{
//                     if(err){
//                         throw err
//                     }

//                     if(isMatch){
//                         return done(null, user)
//                     }else{
//                         return done(null, false, {message: "La password non è corretta"});
//                     }
//                 });
//             }else{
//                 return done(null, false, {message: "Email non registrata"});
//             }
//         }
//     )
// }
//     passport.use(
//         new LocalStrategy({
//             usernameField: "email",
//             passwordField: "password"
//         }, autheticateUser)
//     );

//     passport.serializeUser((user, done)=> done(null, user.id));

//     passport.deserializeUser((id, done)=>{
//         pool.query(
//             `SELECT * FROM hotel WHERE id = $1`, 
//             [id],
//             (err, results)=>{
//                 if (err){
//                     throw err;
//                 }
//                 return done(null, results.rows[0]);
//             }); 
//     });
// }

// module.exports = inizialize;





// function initialize(passport) {
    // const authenticateUser = (email, password, done) => {
    //     pool.query(
    //         `SELECT * FROM hotel WHERE email = $1`,
    //         [email], // Usa 'email' qui, non 'Email'
    //         (err, results) => {
    //             if (err) {
    //                 throw err;
    //             }
    //             if (results.rows.length > 0) {
    //                 const user = results.rows[0];

    //                 bcrypt.compare(password, user.password, (err, isMatch) => {
    //                     if (err) {
    //                         return done(err);
    //                     }

    //                     if (isMatch) {
    //                         return done(null, user);
    //                     } else {
    //                         return done(null, false, { message: "La password non è corretta" });
    //                     }
    //                 });
    //             } else {
    //                 return done(null, false, { message: "Email non registrata" });
    //             }
    //         }
    //     );
    // };