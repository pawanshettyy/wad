const http = require('http')
const fs = require("fs")
const path = require("path")

const PORT  = 3000;

const server = http.createServer((req, res) => {
    console.log(`incoming request ${req.method} ${req.url}`)

    let filepath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url)

        if (!path.extname(filepath)) {
        filepath += '.html';
    }

    fs.readFile(filepath, "utf8", (err, data) => {
        if (err) {
            console.error(err)
            res.writeHead(404, { "Content-Type": "text/plain" })
            res.end("404 not found")
        } else {
            res.writeHead(200, { "Content-Type": "text/html" })
            res.end(data)
        }
    })
})

server.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`)
})