import client from "./src/controllers/controller.js";
import { ObjectId } from "mongodb";
import express, { response } from "express";

const app = express();
const port = 4000;

app.use(express.json());

app.post("/newRoom", async (req, res) => {
  try {
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const room = req.body;

    //Crear
    const resultado = await collection.insertOne(room);
    console.log(resultado);

    res.status(201).send({ insertedId: resultado.insertedId });
  } catch (error) {
    console.error("Error al insertar el sala:", error);
    res.status(500).send("Error al insertar la sala");
  }
});

app.get("/", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    //Obtener
    const rooms = await collection.find().toArray();

    res.json(rooms);
  } catch (error) {
    req.status(500).send(error.message);
  }
});

app.put("/room/:id", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const id = req.params.id;
    const roomUpdated = req.body;

    //Actualizar
    const room = await collection.findOne({ _id: new ObjectId(id) });

    if (!room) {
      req.status(404).send({ message: "Sala no encontrada" });
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

app.delete("/room/:id", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
