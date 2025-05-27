// src/services/room.ts

import { Room } from "@/models/Type";


const STORAGE_KEY = 'hotel_rooms';

export function getRooms(): Room[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveRooms(rooms: Room[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

export function addRoom(room: Room) {
  const rooms = getRooms();
  rooms.push(room);
  saveRooms(rooms);
}

export function updateRoom(updatedRoom: Room) {
  const rooms = getRooms().map(room => (room.roomid === updatedRoom.roomid ? updatedRoom : room));
  saveRooms(rooms);
}

export function deleteRoom(roomid: number) {
  const rooms = getRooms().filter(room => room.roomid !== roomid);
  saveRooms(rooms);
}
