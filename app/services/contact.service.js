const { ObjectId } = require("mongodb");

class ContactService {
  constructor(client) {
    this.contact = client.db().collection("contacts");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractContactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite,
    };
    // Remove undefined fields
    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key]
    );
    return contact;
  }

  // Handler create
  async create(payload) {
    const contact = this.extractContactData(payload);
    const result = await this.contact.findOneAndUpdate(
      contact,
      {
        $set: { favorite: contact.favorite === true },
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );
    return result;
  }

  // Handler findAll
  async find(filter) {
    const cusor = await this.contact.find(filter);
    return await cusor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $option: "i" },
    });
  }

  // Handler findOne
  async findById(id) {
    return await this.contact.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Handler update
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractContactData(payload);
    const result = await this.contact.findOneAndUpdate(
      filter,
      {
        $set: update,
      },
      {
        returnDocument: "after",
      }
    );
    return result;
  }

  // Handler delete
  async delete(id) {
    const result = await this.contact.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // Handler findAllFavorite
  async findFavorite() {
    return await this.find({ favorite: true });
  }

  // Handler deleteAll
  async deleteAll() {
    const result = await this.contact.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = ContactService;
