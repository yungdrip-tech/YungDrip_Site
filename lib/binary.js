export function toBuffer(data) {
  if (!data) {
    return null;
  }

  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (typeof data.value === "function") {
    return data.value(true);
  }

  if (data.buffer) {
    return Buffer.from(data.buffer);
  }

  return Buffer.from(data);
}
