// ===============
// Puerto
// ===============
port = process.env.PORT || 3000; // process.env.PORT = process.env.PORT || 3000;

// ===============
// Entorno
// ===============
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===============
// DB
// ===============

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafecito'; // Local
} else {
    urlDB = process.env.MONGO_URI; // Remota

}

process.env.URLDB = urlDB;

// mongodb+srv://mabvmex:<password>@cluster0-hpudi.mongodb.net/test