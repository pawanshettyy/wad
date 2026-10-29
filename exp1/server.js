const http = require("http");
const PORT = 3000;
const server = http.createServer((req, res) => {
    if(req.url == "/" && req.method == "GET"){
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello, World!\n");
    }else if (req.url == "/about" && req.method == "GET"){
        res.writeHead(200, { "Content-Type": "text/plain" })
        res.end("some more text")
    }
    else{
        res.writeHead(404, { "Content-Type": "text/plain" })
        res.end("404 not found")
    }
  
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})