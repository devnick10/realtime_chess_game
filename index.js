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
let currentPlayer = "w";

app.set("view engine","ejs");
app.use(express.static(path.resolve("public")));



app.get("/",(req,res)=>{
    res.render("index");
});


io.on("connection", (uniqsocket) => {
    // console.log(`connected: ${uniqsocket.id}`);

    if (!players.white) {
        players.white = uniqsocket.id;
        uniqsocket.emit("playerRole", "w");
    } else if (!players.black) {
        players.black = uniqsocket.id;
        uniqsocket.emit("playerRole", "b");
    } else {
        uniqsocket.emit("spectatorRole");
        uniqsocket.emit("boardState", chess.fen()); // Send current state to spectators
    }

    uniqsocket.on("move", (move) => {
        try {
            if (chess.turn() === 'w' && uniqsocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniqsocket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());

            } else {
                console.log("Invalid move:", move);
                uniqsocket.emit("invalidMove", move);
            }
 
             if (players.white || players.black === null) {
                
                 io.emit("gameOver", chess.fen());
             }

        } catch (error) {
            console.error("Error processing move:", error);
            uniqsocket.emit("invalidMove", move);
        }
    });
    
    uniqsocket.on("disconnect", () => {
        // console.log(`disconnected: ${uniqsocket.id}`);
        if (uniqsocket.id === players.white) {
            delete players.white;
            
        }
        if (uniqsocket.id === players.black) {
            delete players.black;
        }
        // Optionally reset the game
        chess.reset();
        io.emit("boardState", chess.fen());
    });
});



