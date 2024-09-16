import client from "./src/controllers/controller.js";
import { ObjectId } from "mongodb";
import express, { response } from "express";

const app = express();
const port = 4002;

app.use(express.json());
// SALA
app.post("/newRoom", async (req, res) => {
  try {
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const room = req.body;

    //Crear
    const result = await collection.insertOne(room);

    res.status(201).send({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send("Error al insertar la sala");
  }
});

app.get("/getRooms", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    //Obtener
    const rooms = await collection.find().toArray();

    res.json(rooms);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.put("/updateRoom/:id", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const id = req.params.id;
    const roomUpdated = req.body;

    //obtener una sala mediante un id
    const room = await collection.findOne({ _id: new ObjectId(id) });
    //pregunta si no existe una sala con el id
    if (!room) {
      res.status(404).send({ message: "Sala no encontrada" });
      return;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: roomUpdated }
    );

    res.status(201).send({ response: result });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete("/deleteRoom/:id", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const id = req.params.id;

    //Eliminar
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).send({ message: "Sala no encontrada" });
      return;
    }

    res.status(200).send({ message: "Sala eliminada " });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// RESERVA

app.post("/room/:id/newBooking", async (req, res) => {
  try {
    const database = client.db("MEETING_ROOMS");
    const collectionRooms = database.collection("ROOMS");
    const collectionBooking = database.collection("BOOKING");

    const id = req.params.id;
    let booking = req.body;
    booking["id_sala"] = id;

    const room = await collectionRooms.findOne({ _id: new ObjectId(id) });

    if (!room) {
      res.status(200).send({ message: "Sala no encontrada" });
      return;
    }

    const result = await collectionBooking.insertOne(booking);

    res.status(201).send({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send("Error al realizar la reserva");
  }
});

//obtener todas las reservas de una sala
app.get("/room/:id/getBooking", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("MEETING_ROOMS");
    const collectionRooms = database.collection("ROOMS");
    const collectionBooking = database.collection("BOOKING");

    const id = req.params.id;

    const room = await collectionRooms.findOne({ _id: new ObjectId(id) });
    //pregunta si no existe una sala con el id
    if (!room) {
      res.status(404).send({ message: "Sala no encontrada" });
      return;
    }

    const booking = await collectionBooking.find({ id_sala: id }).toArray();

    res.status(201).send(booking);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/room/getBooking/:user_id", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("MEETING_ROOMS");
    const collectionRooms = database.collection("ROOMS");
    const collectionBooking = database.collection("BOOKING");

    const user_id = req.params.user_id;

    const booking = await collectionBooking
      .find({ usuario: user_id })
      .toArray();

    if (booking.length > 0) {
      res.status(200).json(booking);
    } else {
      res
        .status(404)
        .json({ message: "No se encontraron reservas para el usuaio" });
    }
    // res.status(201).send(booking);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
