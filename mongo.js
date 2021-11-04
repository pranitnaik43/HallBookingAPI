const { MongoClient } = require("mongodb"); 

const client = new MongoClient(process.env.MONGODB_URL);

const mongo = {
  users: null,
  rooms: null,
  bookings: null,
  async connect() {
    await client.connect();
    const db = client.db(process.env.MONGODB_NAME);
    console.log("Mongo DB connected");

    this.users = db.collection("users");
    this.rooms = db.collection("rooms");
    this.bookings = db.collection("bookings");
  }
}

module.exports = mongo;