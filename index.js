import express from "express";
import http from "http";
import { Chess } from "chess.js";
import {Server} from "socket.io";
import path from "path";

const app = express();

export const server = http.createServer(app);
const io = new Server(server);


const chess = new Chess();

const players = {};
const currentPlayer = "w";

app.set("view engine","ejs");
app.use(express.static(path.resolve("public")));



app.get("/",(req,res)=>{
    res.render("index");
});

io.on("connection",(uniqsocket)=>{

    console.log(`connected`);

    
    if (!players.white) {
         
        players.white = uniqsocket.id;
        uniqsocket.emit("playerRole","w");

    }else if(!players.black){
       
      players.black = uniqsocket.id; 
      uniqsocket.emit("playerRole","b");

    }else{

        uniqsocket.emit("spectatorRole");

    };

    uniqsocket.on("move",(move)=>{
      
        try {
             
            if (chess.turn() === 'w' && uniqsocket.id !== players.white) return 

            if (chess.turn() === 'b' && uniqsocket.id !== players.black) return 
          
            const result =  chess.move(move);

            if (result) {

                currentPlayer = chess.turn();
                
                io.emit("move",move)
                io.emit("boardState",chess.fen());
        
            }else{
                console.log("Invalid Move",move);
                
                uniqsocket.emit("invalidMove",move);
                
            };
            
        } catch (error) {
            console.log(error);
            
            uniqsocket.emit("invalid Move :",move);

        };

    });
   
    uniqsocket.on("disconnect", () => {
     
    if (uniqsocket.id == players.white) {

        delete players.white;
        
    };
    if (uniqsocket.id == players.black) {
        
        delete players.black;

    };



    });


    
    
});


