import client from "./src/controllers/controller.js";
import { ObjectId } from "mongodb";
import express from "express";
import cors from "cors";

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
// SALA
app.post("/newRoom", async (req, res) => {
  try {
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const room = req.body;

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

    res.status(200).send(JSON.stringify(rooms));
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
    const collectionBooking = database.collection("BOOKING");

    const user_id = req.params.user_id;

    const booking = await collectionBooking.find({ _id: user_id }).toArray();

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

app.get("/room/:id_room/getBooking", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("MEETING_ROOMS");
    const collectionRooms = database.collection("ROOMS");

    const id_room = req.params.id_room;

    const room = await collectionRooms.findOne({ _id: id_room }).toArray();

    if (!room) {
      res.status(404).send({ message: "Sala no encontrada" });
      return;
    }

    const collectionBooking = database.collection("BOOKING");

    const booking = await collectionBooking.find({ id_sala: id_room });

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

app.put("/room/:idroom/updateBooking/:idbooking", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("MEETING_ROOMS");
    const collectionRooms = database.collection("ROOMS");

    const id_room = req.params.idroom;
    const id_booking = req.params.idbooking;

    const room = await collectionRooms.findOne({ _id: new ObjectId(id_room) });

    if (!room) {
      res.status(404).send({ message: "Sala no encontrada" });
      return;
    }

    const bookingUpdated = req.body;

    const collectionBooking = database.collection("BOOKING");

    const booking = await collectionBooking.findOne({
      _id: new ObjectId(id_booking),
    });

    if (!booking) {
      res.status(404).send({ message: "Reserva no encontrada" });
      return;
    }

    console.log(bookingUpdated.fecha);
    console.log(bookingUpdated.hora);

    const result = await collectionBooking.updateOne(
      { _id: new ObjectId(id_booking) },
      { $set: { fecha: bookingUpdated.fecha, hora: bookingUpdated.hora } }
    );

    if (result.modifiedCount === 0) {
      res
        .status(400)
        .send({ message: "No se realizaron cambios en la reserva" });
    } else {
      res.status(200).send({ response: result });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete("/room/:id_room/deleteBooking/:id_booking", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("MEETING_ROOMS");
    const collectionRooms = database.collection("ROOM");
    const collectionBooking = database.collection("BOOKING");

    const id_room = req.params.id_room;
    const id_booking = req.params.id_booking;

    const room = await collectionRooms.deleteOne({
      _id: new ObjectId(id_room),
    });

    if (!room) {
      res.status(404).send({ message: "Sala no encontrada" });
      return;
    }

    const booking = await collectionBooking.deleteOne({
      _id: new ObjectId(id_booking),
    });

    if (booking.deletedCount === 0) {
      res.status(404).send({ message: "Reserva no encontrada" });
      return;
    }

    res.status(200).send({ message: "Reserva eliminada " });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
