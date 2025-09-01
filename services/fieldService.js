const db = require('../db/init');
const Field = require('../models/Field');

class FieldService {
  constructor() {
    this.db = db;
  }

  /**
   * Initialize default fields if they don't exist
   */
  async initializeDefaultFields() {
    try {
      const defaultFields = [
        {
          name: 'field1',
          position: { x: -6, y: 63, z: 167, length: 18, width: 11 },
          plant: 'wheat',
          chest: { x: -9, y: 63, z: 178 }
        }
      ];

      for (const fieldData of defaultFields) {
        const existing = this.getFieldByName(fieldData.name);
        if (!existing) {
          await this.createField(fieldData);
          console.log(`Created default field: ${fieldData.name}`);
        }
      }
      return true;
    } catch (error) {
      console.error('Error initializing default fields:', error);
      throw error;
    }
  }

  /**
   * Get all fields
   * @returns {Array<Field>} Array of Field instances
   */
  getAllFields() {
    const rows = this.db.prepare('SELECT * FROM fields').all();
    return rows.map(row => new Field(row));
  }

  /**
   * Get field by name
   * @param {string} name - Field name
   * @returns {Field|null} Field instance or null if not found
   */
  getFieldByName(name) {
    try {
      const row = this.db.prepare('SELECT * FROM fields WHERE name = ?').get(name);
      return row ? new Field(row) : null;
    } catch (error) {
      console.error(`Error getting field by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get field by ID
   * @param {number} id - Field ID
   * @returns {Field|null} Field instance or null if not found
   */
  getFieldById(id) {
    const row = this.db.prepare('SELECT * FROM fields WHERE id = ?').get(id);
    return row ? new Field(row) : null;
  }

  /**
   * Create a new field
   * @param {Object} fieldData - Field data
   * @returns {Field} Created field instance
   */
  createField(fieldData) {
    const result = this.db.prepare(`
      INSERT INTO fields (
        name, position_x, position_y, position_z, length, width, 
        plant, chest_x, chest_y, chest_z
      ) VALUES (
        @name, @position_x, @position_y, @position_z, @length, @width,
        @plant, @chest_x, @chest_y, @chest_z
      )
    `).run({
      name: fieldData.name,
      position_x: fieldData.position.x,
      position_y: fieldData.position.y,
      position_z: fieldData.position.z,
      length: fieldData.position.length,
      width: fieldData.position.width,
      plant: fieldData.plant,
      chest_x: fieldData.chest.x,
      chest_y: fieldData.chest.y,
      chest_z: fieldData.chest.z
    });

    return this.getFieldById(result.lastInsertRowid);
  }

  /**
   * Update a field
   * @param {number} id - Field ID
   * @param {Object} updates - Field updates
   * @returns {Field} Updated field instance
   */
  updateField(id, updates) {
    const field = this.getFieldById(id);
    if (!field) return null;

    const updatedField = {
      ...field,
      ...updates,
      position: { ...field.position, ...(updates.position || {}) },
      chest: { ...field.chest, ...(updates.chest || {}) }
    };

    this.db.prepare(`
      UPDATE fields SET
        name = @name,
        position_x = @position_x,
        position_y = @position_y,
        position_z = @position_z,
        length = @length,
        width = @width,
        plant = @plant,
        chest_x = @chest_x,
        chest_y = @chest_y,
        chest_z = @chest_z
      WHERE id = @id
    `).run({
      id,
      name: updatedField.name,
      position_x: updatedField.position.x,
      position_y: updatedField.position.y,
      position_z: updatedField.position.z,
      length: updatedField.position.length,
      width: updatedField.position.width,
      plant: updatedField.plant,
      chest_x: updatedField.chest.x,
      chest_y: updatedField.chest.y,
      chest_z: updatedField.chest.z
    });

    return this.getFieldById(id);
  }

  /**
   * Delete a field
   * @param {number} id - Field ID
   * @returns {boolean} True if deleted, false otherwise
   */
  deleteField(id) {
    const result = this.db.prepare('DELETE FROM fields WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = new FieldService();
