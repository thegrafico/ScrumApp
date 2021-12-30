const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log(`Connected to Database: ${conn.connection.host}`);
        const collections = Object.keys(conn.connection.collections)
        console.log("DBS: ", collections);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

const removeDB = async () => {
    try{
        const conn = mongoose.createConnection(process.env.MONGO_LOCAL_URI);
        await conn.dropDatabase();
        console.log("Database removed");
    }catch(err) {
        console.error(err);
    }
}

module.exports.connectDB = connectDB;
module.exports.removeDB = removeDB;
