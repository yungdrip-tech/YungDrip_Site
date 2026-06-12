function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload;
}

export async function fetchProducts(params = {}, options = {}) {
  const response = await fetch(`/api/products${buildQueryString(params)}`, {
    method: "GET",
    ...options
  });

  return parseApiResponse(response);
}

export async function fetchProductById(id, options = {}) {
  const response = await fetch(`/api/products/${id}`, {
    method: "GET",
    ...options
  });

  return parseApiResponse(response);
}

async function sendJson(url, { method = "POST", body, ...options } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options
  });

  return parseApiResponse(response);
}

export async function fetchSession(options = {}) {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    ...options
  });

  return parseApiResponse(response);
}

export function registerUser(payload) {
  return sendJson("/api/auth/register", { body: payload });
}

export function loginUser(payload) {
  return sendJson("/api/auth/login", { body: payload });
}

export function logoutUser() {
  return sendJson("/api/auth/logout");
}

export function fetchOrders() {
  return sendJson("/api/orders", { method: "GET" });
}

export function fetchOrderById(id) {
  return sendJson(`/api/orders/${id}`, { method: "GET" });
}

export function createCheckoutOrder(payload) {
  return sendJson("/api/checkout/create-order", { body: payload });
}

export function verifyCheckoutOrder(payload) {
  return sendJson("/api/checkout/verify", { body: payload });
}

export function fetchAdminOrders(params = {}) {
  const query = buildQueryString(params);

  return sendJson(`/api/admin/orders${query}`, { method: "GET" });
}

export function updateAdminOrderStatus(id, payload) {
  return sendJson(`/api/admin/orders/${id}`, {
    method: "PUT",
    body: payload
  });
}

export function fetchAdminOrderById(id) {
  return sendJson(`/api/admin/orders/${id}`, { method: "GET" });
}

export function fetchAdminStats() {
  return sendJson("/api/admin/stats", { method: "GET" });
}

export function fetchAdminUsers() {
  return sendJson("/api/admin/users", { method: "GET" });
}

export function updateAdminUserRole(id, payload) {
  return sendJson(`/api/admin/users/${id}`, { method: "PUT", body: payload });
}

export function createAdminProduct(payload) {
  return sendJson("/api/products", { body: payload });
}

export function updateAdminProduct(id, payload) {
  return sendJson(`/api/products/${id}`, { method: "PUT", body: payload });
}

export function deleteAdminProduct(id) {
  return sendJson(`/api/products/${id}`, { method: "DELETE" });
}
