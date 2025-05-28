import { RoomService } from "@/models/Type";

const STORAGE_KEY = 'room_service_list';

export async function getRoomServiceList(): Promise<RoomService[]> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export async function saveRoomServiceList(data: RoomService[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function addRoomService(item: RoomService) {
  const list = await getRoomServiceList();
  list.push(item);
  await saveRoomServiceList(list);
}

export async function updateRoomService(item: RoomService) {
  const list = await getRoomServiceList();
  const index = list.findIndex(i => i.ID === item.ID);
  if (index !== -1) {
    list[index] = item;
    await saveRoomServiceList(list);
  }
}

export async function deleteRoomService(id: number) {
  const list = await getRoomServiceList();
  await saveRoomServiceList(list.filter(i => i.ID !== id));
}
