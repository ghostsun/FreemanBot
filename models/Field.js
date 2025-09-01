class Field {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.position = {
      x: data.position_x,
      y: data.position_y,
      z: data.position_z,
      length: data.length,
      width: data.width
    };
    this.plant = data.plant;
    this.chest = {
      x: data.chest_x,
      y: data.chest_y,
      z: data.chest_z
    };
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      plant: this.plant,
      chest: this.chest,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new Field({
      id: data.id,
      name: data.name,
      position_x: data.position.x,
      position_y: data.position.y,
      position_z: data.position.z,
      length: data.position.length,
      width: data.position.width,
      plant: data.plant,
      chest_x: data.chest.x,
      chest_y: data.chest.y,
      chest_z: data.chest.z,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
}

module.exports = Field;
