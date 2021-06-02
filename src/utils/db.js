let mongoose = require('mongoose');
const Users = require('../models/usuario')
const Movies = require('../models/movie')

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        console.log(process.env.MONGODB_NAME)
        mongoose.connect(process.env.MONGODB_URI_FULL || (`mongodb://${process.env.MONGODB_URI || "127.0.0.1:27017"}/${process.env.MONGODB_NAME || "movies-api"}`), {
                useCreateIndex: true,
                useUnifiedTopology: true,
                useNewUrlParser: true
            })
            .then(async(db) => {
                console.log('Database connection successful')
                var count = await Users.countDocuments().exec();
                console.log(count);
                if (count == 0) {
                    Users.create({
                        name: "admin",
                        username: "test@test.com",
                        email: "test@test.com",
                        password: "1234"
                    })
                }
                /*
                                let res = await Movies.aggregate([
                                    { "$group": { "_id": "$name", "count": { "$sum": 1 } } },
                                    { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
                                    { "$project": { "name": "$_id", "_id": 0 } }
                                ]);

                                console.log(res);

                                res = await Movies.aggregate([
                                    { "$group": { "_id": "$duration", "count": { "$sum": 1 } } },
                                    { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
                                    { "$project": { "duration": "$_id", "_id": 0 } },
                                    { $sort: { duration: 1 } }

                                ]);

                                console.log(res);

                                res = await Movies.aggregate([{
                                        $group: {
                                            _id: { duration: "$duration" },
                                            idsForDuplicatedDocs: { $addToSet: "$_id" },
                                            count: { $sum: 1 }
                                        }
                                    },
                                    {
                                        $match: {
                                            count: { $gt: 1 }
                                        }
                                    },
                                    { $sort: { count: -1 } }
                                ]);

                                console.log(JSON.stringify(res));*/
            })
            .catch(err => {
                console.log(err)
                console.error('Database connection error')
            })
    }
}

module.exports = new Database()