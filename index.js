import express from "express"
const app = express()
const port = 3000;

console.log("Hello World!")

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})