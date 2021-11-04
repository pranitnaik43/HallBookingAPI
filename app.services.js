const { ObjectId } = require("mongodb");
const Joi = require("joi");

const db = require("./mongo");

const RoomBody = Joi.object({
  name: Joi.string().required(),
  num_of_seats: Joi.number().required(),
  amenities: Joi.array(),
  price: Joi.number().required(),
  address: Joi.string().required()
});

const UserBody = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  mobile: Joi.string().required(),
  aadhar_num: Joi.string().required()
});

const BookRoomBody = Joi.object({
  room_id: Joi.string().required(),
  user_id: Joi.string().required(),
  date: Joi.date().required(),
  start_time: Joi.string(),
  end_time: Joi.string()
});

const service = {
  async getUsers(req, res) {
    let data = await db.users.find().toArray();
    res.send(data);
  },
  async getUserFromId(id) {
    let data = await db.users.findOne({ _id: new ObjectId(id) });
    return data;
  },
  async createUser(req, res) {
    // Validate Request Body
    const { error } = await UserBody.validate(req.body);
    if (error) return res.send({ error: { message: error.details[0].message }});

    await db.users.insertOne({ ...req.body });
    res.status(200).send({ success: { message: "Room created successfully" } });
  },
  async createRoom(req, res) {
    // Validate Request Body
    const { error } = await RoomBody.validate(req.body);
    if (error) return res.send({ error: { message: error.details[0].message }});

    await db.rooms.insertOne({ ...req.body });
    res.status(200).send({ success: { message: "Room created successfully" } });
  },
  async getRooms() {
    let data = await db.rooms.find().toArray();
    return data;
  },
  async getRoomFromId(id) {
    let room = await db.rooms.findOne({ _id: new ObjectId(id) });
    return room;
  },
  async isRoomBooked(room_id, date) {
    // console.log(room_id.toString(), date);
    let data = await db.bookings.findOne({ room_id: room_id.toString(), date });
    // console.log("check",data);
    if(data) return true;
    return false;
  },
  async getUnoccupiedRooms(req, res) {
    let url = req.url;
    //check query string for date
    let splitString = url.split("?");
    if(!splitString[1]) { return res.send({ error: { message: "No date given" } }); }
    
    let queryStr = splitString[1];
    let params = new URLSearchParams(queryStr);

    if(!params.has("date")) { return res.send({ error: { message: "No date given" } }); }

    let date = params.get("date");

    let rooms = await this.getRooms();

    //filter unoccupied rooms -> rooms which won't have booking data
    let unoccupiedRooms = await Promise.all(
      rooms.map(async (room) => {
        let data = await db.bookings.findOne({ room_id: room._id.toString(), date });
        if(data) return null;
        return room;
      })
    );
    // console.log("check1",unoccupiedRooms);
    unoccupiedRooms = unoccupiedRooms.filter((data) => ( (data) ? true: false ))
    res.send(unoccupiedRooms);
  },
  async bookRoom(req, res) {
    // Validate Request Body
    const { error } = await BookRoomBody.validate(req.body);
    if (error) return res.send({ error: { message: error.details[0].message }});

    //check if room exists
    let room = await this.getRoomFromId(req.body.room_id);
    if(!room) return res.send({ error: { message: "Room does not exist" }});

    //check if user exists
    let user = await this.getUserFromId(req.body.user_id);
    if(!user) return res.send({ error: { message: "User does not exist" }});

    //check if room is booked
    if(await this.isRoomBooked(req.body.room_id, req.body.date)) {
      return res.send({ error: { message: "Room is not available" }});
    }

    await db.bookings.insertOne({ ...req.body });
    res.status(200).send({ error: { message: "Room booked successfully" }});
  },
  async getUsersBookingDetails(req, res) {
    let bookings = await db.bookings.find().toArray();

    //get user data for each booking
    bookings = await Promise.all(bookings.map(async (booking) => {
      let user = await this.getUserFromId(booking.user_id);
      booking = { ...user, ...booking };
      return booking;
    }))
    res.send(bookings);
  },
  async getRoomsBookingDetails(req, res) {
    let bookings = await db.bookings.find().toArray();

    //get user data for each booking
    bookings = await Promise.all(bookings.map(async (booking) => {
      let room = await this.getRoomFromId(booking.room_id);
      booking = { ...room, ...booking };
      return booking;
    }))
    res.send(bookings);
  }
}

module.exports = service;