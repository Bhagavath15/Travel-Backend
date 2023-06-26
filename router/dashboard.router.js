import express from "express"; // "type": "module"
import { client } from "../index.js"

const router = express.Router()

router.post("/tours", async function (request, response) {
    const result = request.body
    const data = await client
        .db("travel")
        .collection("tours")
        .insertOne(result)
    response.send(data)
})

router.get("/tours", async function (request, response) {
    const detail = await client
        .db("travel")
        .collection("tours")
        .find({})
        .toArray();
    response.send(detail)
})
router.get("/tours/:id", async function (request, response) {
    const { id } = request.params
    const detail = await client
        .db("travel")
        .collection("tours")
        .findOne({ id: id })
    detail ? response.send(detail) : response.status(404).send({ message: "Detail is not found" })
})


export default router