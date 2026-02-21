const http = require("http");

const server = http.createServer((req, res) => {
  res.end("hello world");
});

server.listen(3001, "0.0.0.0", () => {
  console.log("listening on 0.0.0.0:3001");
});