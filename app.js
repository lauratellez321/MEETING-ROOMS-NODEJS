import client from "./src/controllers/controller.js";
import express from "express";
const app = express();
const port = 3001;

app.use(express.json());

app.post("/insert", async (req, res) => {
  try {
    const database = client.db("MEETING_ROOMS");
    const collection = database.collection("ROOMS");

    const dato = req.body;

    const resultado = await collection.insertOne(dato);
    console.log(resultado);

    res.status(201).send({ insertedId: resultado.insertedId });
  } catch (error) {
    console.error("Error al insertar el documento:", error);
    res.status(500).send("Error al insertar el documento");
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
