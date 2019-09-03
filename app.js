const net = require('net');
const http = require('http');
const figs = require('./configs.js');
const express = require('express');
const app = express();
const fs = require('fs');
let io = null;
const path = require('path');
let count = 0;
let test_socket = null;
let visited = [];
let servers = [];
let server = null;
let nodes = [{}];
let edges = [{}];
let groups = {};

figs.forEach((item) => {
    server = http.createServer(app,Req_);
    server.listen(item ,() => {
        console.log("listening on: "+ item['port']);
    });
    servers.push(server);
})
servers.forEach((server, idx, arr) => {
server.on("connection", () => {
    count++;
    let check = visited.find((item) => {return item === server.address()['port']});
    if (count === visited.length){
        visited.length = 0;
        count = 0;
        return ;
    }
    if (check === server.address()['port'])
        return ;
        figs.forEach((item) => 
        {
            check = visited.find((item) => {return item === server.address()['port']});
            if (check !== server.address()['port'])
                visited.push(server.address()['port']);
            item["connects"].forEach((port) => {
            check = visited.find((item) => {return item === port});
            if (check === port)
            {
                return ;
            }
            else
            {
                visited.push(port);
                test_socket = new net.Socket();
                console.log(visited);
                test_socket.connect(port);
            }
            });
        })
    });
});
function Req_(req, res)
{
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('index.html', function(error, data) {
        if (error)
        {
            res.writeHead(404);
            res.write("Error file not found");
        }
        else
        {
            let url = req.url;
            let ha = 'ha';
            if (url == '/')
                res.write(data);
        }
        res.end();
    res.end();
    })
}
app.use(express.static(__dirname));
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
  });

app.get('/network', function (req, res) {
    figs.forEach((item) => {
        if (!item['port'] || !item['connects'])
            return ;
        nodes.push({ id: item['port'],label: item['name'] });
        item['connects'].forEach((conn) =>{
            if (!item['port'] || !conn)
                return ;
        edges.push({ from: item['port'], to: conn});
        })
    })
    groups = {nodes: nodes, edges: edges};
    res.send(groups);
    groups.length = 0;
    nodes.length = 0;
    edges.length = 0;
  });

 