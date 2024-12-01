import http from 'node:http';
import serveHandler from 'serve-handler';
import ws, { WebSocketServer } from 'ws';
import { Redis } from 'ioredis';

const redisPub = new Redis();
const redisSub = new Redis();

const server = http.createServer((req, res) => {
  serveHandler(req, res, {public: "www"});
});

const wss = new WebSocketServer({ server });

wss.on("connection", client => {
  console.log("Client connected");
  client.on("message", msg => {
    redisPub.publish("channel_messages", msg)
  });
})

redisSub.subscribe("channel_messages");

redisSub.on("message", (channel, msg) => {
  for( const client of wss.clients){
    if(client.readyState === ws.OPEN) {
      client.send(msg);
    }
  }
});

server.listen(process.argv[2] || 8080);
