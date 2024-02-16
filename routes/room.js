const express = require('express');
const connection = require('../connection');
const router = express.Router();
require('dotenv').config();

router.get('/available-rooms', (req, res) => {
    const query = `
      SELECT room_number, floor_number, vacant_seats
      FROM room_master_tbl
      WHERE vacant_seats > 0
      ORDER BY floor_number, room_number
    `;
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error retrieving available rooms: ' + err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      return res.status(200).json(results);
    });
  });
  
  // API endpoint to allocate room to a student
  router.post('/allocate-room', (req, res) => {
    const { studentId, hostelId, roomNumber } = req.body;
  
    // Check if room has vacant seats
    const checkVacantSeatsQuery = `
      SELECT vacant_seats
      FROM room_master_tbl
      WHERE hostel_id = ? AND room_number = ? AND vacant_seats > 0
    `;
    connection.query(checkVacantSeatsQuery, [hostelId, roomNumber], (err, results) => {
      if (err) {
        console.error('Error checking vacant seats: ' + err);
        return res.status(500).json({ error: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(400).json({ message: "No vacant seats available in the selected room" });
      }
  
      // Allocate room to student
      const allocateRoomQuery = `
        INSERT INTO studentroom (hostel_id, room_number, student_id)
        VALUES (?, ?, ?)
      `;
      connection.query(allocateRoomQuery, [hostelId, roomNumber, studentId], (err, results) => {
        if (err) {
          console.error('Error allocating room: ' + err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        // Update vacant seats count
        const updateVacantSeatsQuery = `
          UPDATE room_master_tbl
          SET vacant_seats = vacant_seats - 1
          WHERE hostel_id = ? AND room_number = ?
        `;
        connection.query(updateVacantSeatsQuery, [hostelId, roomNumber], (err, results) => {
          if (err) {
            console.error('Error updating vacant seats count: ' + err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          return res.status(200).json({ message: "Room allocated successfully" });
        });
      });
    });
  });
  
  module.exports = router;