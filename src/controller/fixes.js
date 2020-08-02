const models = require("../models");
const { capitalizeFirstLetter } = require("../utils/text");
const Actors = models.actormodel;
const Movies = models.moviemodel;
const Categories = models.categoriamodel;
const Studios = models.studioSchema;
const socketServer = require("../services/socket").socketServer

async function specialName(req, res) {
    let list = await Movies.find({});
    let process = 0;
    const size = list.length;
    list.forEach(async (e, i) => {
        if (e.name) {
            if (!e.visualname) {
                let count = (e.name.match(/\./g) || []).length;
                if (count >= 4) {
                    let splitted = e.name.split(".");
                    let actor = {};
                    actor = await Actors.findOne({ name: splitted[4] });
                    if (actor)
                        e.reparto.push(actor)

                    if (splitted[5]) {
                        splitted[5] = capitalizeFirstLetter(splitted[5]);
                        splitted[4] = capitalizeFirstLetter(splitted[4]);
                        actor = await Actors.findOne({ name: splitted[4] + " " + splitted[5] });
                        if (actor)
                            e.reparto.push(actor)
                    }
                    e.reparto = []
                    for (let i = 0; i < splitted.length; i++) {
                        if (splitted[i] == "and") {
                            splitted[i - 1] = capitalizeFirstLetter(splitted[i - 1]);
                            splitted[i - 2] = capitalizeFirstLetter(splitted[i - 2]);
                            actor = await Actors.findOne({ name: splitted[i - 1] });
                            if (!actor) {
                                actor = await Actors.findOne({ name: splitted[i - 2] + " " + splitted[i - 1] })
                            }
                            if (actor)
                                e.reparto.push(actor)
                            if (splitted[i + 1]) {
                                splitted[i + 1] = capitalizeFirstLetter(splitted[i + 1]);
                                actor = await Actors.findOne({ name: splitted[i + 1] });
                            }
                            if (actor)
                                e.reparto.push(actor)

                            if (splitted[i + 2]) {
                                splitted[i + 2] = capitalizeFirstLetter(splitted[i + 2]);
                                actor = await Actors.findOne({ name: splitted[i + 1] + " " + splitted[i + 2] });
                            }
                            if (actor)
                                e.reparto.push(actor)

                        }

                    }
                    e.visualname = capitalizeFirstLetter(splitted[0]) + " - " + capitalizeFirstLetter(splitted.slice(4).join(" "));
                    e.year = parseInt("20" + splitted[1])
                    e.studio = capitalizeFirstLetter(splitted[0])
                    await Movies.findByIdAndUpdate({ _id: e._id }, { $set: e });
                }
                if (count == 0) {
                    e.visualname = e.name.replace(".", "");
                    await Movies.findByIdAndUpdate({ _id: e._id }, { $set: e });
                }
            }
        }
        try {
            process = Math.floor((i + 1) * 100 / (size), 0)
            if (socketServer.socket)
                socketServer.socket.emit("RMF", { process, name: e.name })
        } catch (error) {
            console.log(error);
        }
    })
    res.send({ msg: "ok" })
}

async function fullfixes(req, res) {

    try {
        let listA = await Actors.find({});
        let find = {
            "$and": [
                {
                    "$or": [{}]
                }, {
                    "$and": [{}]
                }
            ]
        }
        let process = 0;
        for (let i = 0; i < listA.length; i++) {
            const a = listA[i];

            find["$and"][0]["$or"][0] = {
                "visualname": { $regex: '.*' + a.name.toLowerCase() + '.*', $options: 'i' }
            }

            find["$and"][1]["$and"][0] = {
                "reparto": {
                    "$not": {
                        "$all": [a._id]
                    }
                }
            }
            //  console.log(JSON.stringify(find));

            let listMTemp = await Movies.aggregate([
                {
                    $project: {
                        visualname: 1,
                        reparto: 1

                    }
                },
                {
                    "$match": find
                }
            ]
            );

            //   console.log(JSON.stringify(listMTemp));

            let update = listMTemp.map((movie) => {
                movie.reparto.push(a)
                return ({
                    updateOne: {
                        filter: { _id: movie._id },
                        update: { $set: movie },
                        upsert: true
                    }
                })
            })
            //       console.log(JSON.stringify(update));
            await Movies.bulkWrite(update)

            try {
                process = Math.floor((i + 1) * 100 / (listA.length), 0)
                if (socketServer.socket)
                    socketServer.socket.emit("RMF", { process, name: "Fixing actors " })
            } catch (error) {
                console.log(error);
            }

        }

        process = 0;

        find = {
            "$and": [
                {
                    "$or": [{}]
                }, {
                    "$and": [{}]
                }
            ]
        }

        let listC = await Categories.find({});

        for (let i = 0; i < listC.length; i++) {
            const c = listC[i];

            find["$and"][0]["$or"][0] = {
                "visualname": { $regex: '.*' + c.name.toLowerCase() + '.*', $options: 'si' }
            }

            find["$and"][1]["$and"][0] = {
                "categorias": {
                    "$not": {
                        "$all": [c._id]
                    }
                }
            }
            //   console.log(JSON.stringify(find));

            let listMTemp = await Movies.aggregate([
                {
                    $project: {
                        visualname: 1,
                        categorias: 1

                    }
                },
                {
                    "$match": find
                }
            ]
            );

            // console.log(JSON.stringify(listMTemp));

            let update = listMTemp.map((movie) => {
                movie.categorias.push(c)
                return ({
                    updateOne: {
                        filter: { _id: movie._id },
                        update: { $set: { categorias: movie.categorias } },
                        upsert: true
                    }
                })
            })
            //console.log("\n" + JSON.stringify(update));
             await Movies.bulkWrite(update)

            try {
                process = Math.floor((i + 1) * 100 / (listC.length), 0)
                if (socketServer.socket)
                    socketServer.socket.emit("RMF", { process, name: "Fixing categories " })
            } catch (error) {
                console.log(error);
            }
        }

        process = 0;

        find = {
            "$and": [
                {
                    "$or": [{}]
                }, {
                    "$and": [{}]
                }
            ]
        }

        let listS = await Studios.find({});

        for (let i = 0; i < listS.length; i++) {
            const s = listS[i];

            find["$and"][0]["$or"][0] = {
                "visualname": { $regex: '.*' + s.name.toLowerCase() + '.*', $options: 'si' }
            }

            find["$and"][1]["$and"][0] = {
                "studio": {
                    "$ne": s._id
                }
            }

            //console.log(JSON.stringify(find));

            let listMTemp = await Movies.aggregate([
                {
                    $project: {
                        visualname: 1,
                        studio: 1

                    }
                },
                {
                    "$match": find
                }
            ]
            );

            // console.log(JSON.stringify(listMTemp));

            let update = listMTemp.map((movie) => {
                return ({
                    updateOne: {
                        filter: { _id: movie._id },
                        update: { $set: { studio: s } },
                        upsert: true
                    }
                })
            })
            //console.log("\n" + JSON.stringify(update));
            await Movies.bulkWrite(update)

            try {
                process = Math.floor((i + 1) * 100 / (listS.length), 0)
                if (socketServer.socket)
                    socketServer.socket.emit("RMF", { process, name: "Fixing studios " })
            } catch (error) {
                console.log(error);
            }
        }



        res.send({ msg: "ok" });

    } catch (error) {
        console.log(error);
        res.send({ msg: "error", error })
    }
}


module.exports = {
    specialName,
    fullfixes
}