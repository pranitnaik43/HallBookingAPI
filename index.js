const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./mongo");

const app = express();
const PORT = (process.env.PORT) ? (process.env.PORT) : 3001;

const appService = require("./app.services");


(async function load() {
  await db.connect();

  app.use(express.json());
  app.use(cors()); 

  //user routes
  app.get("/users", (req, res) => appService.getUsers(req, res));
  app.post("/create-user", (req, res) => appService.createUser(req, res));
  app.get("/users-booking-details", (req, res) => appService.getUsersBookingDetails(req, res));

  //room routes
  app.get("/unoccupied-rooms", (req, res) => appService.getUnoccupiedRooms(req, res));
  app.post("/create-room", (req, res) => appService.createRoom(req, res));
  app.post("/book-room", (req, res) => appService.bookRoom(req, res));
  app.get("/rooms-booking-details", (req, res) => appService.getRoomsBookingDetails(req, res));
  
  app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
  });

}()); //immediately invoked function

