import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadBrokerageLogo(
  brokerageId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const storageRef = ref(storage, `brokerages/${brokerageId}/logo.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteBrokerageLogo(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}
