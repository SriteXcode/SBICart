export const saveOffline = (data) => {
  const pending = JSON.parse(localStorage.getItem("offline") || "[]");
  pending.push(data);
  localStorage.setItem("offline", JSON.stringify(pending));
};

export const syncOffline = async (api) => {
  const pending = JSON.parse(localStorage.getItem("offline") || "[]");
  for (let p of pending) {
    await api.post("/customers", p);
  }
  localStorage.removeItem("offline");
};
