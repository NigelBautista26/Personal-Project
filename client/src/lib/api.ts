import type { User, Photographer, Booking, Earning } from "@shared/schema";

const API_BASE = "/api";

// Auth API
export async function register(email: string, password: string, fullName: string, role: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, role }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }
  
  return response.json();
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  
  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/me`);
  
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  
  return response.json();
}

// Photographer API
export async function getPhotographers(): Promise<Photographer[]> {
  const response = await fetch(`${API_BASE}/photographers`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch photographers");
  }
  
  return response.json();
}

export async function getPhotographer(id: string): Promise<Photographer> {
  const response = await fetch(`${API_BASE}/photographers/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch photographer");
  }
  
  return response.json();
}

// Booking API
export async function createBooking(booking: {
  customerId: string;
  photographerId: string;
  duration: number;
  location: string;
  scheduledDate: Date;
  scheduledTime: string;
  totalAmount: string;
}): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Booking failed");
  }
  
  return response.json();
}

export async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/bookings/customer/${customerId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  
  return response.json();
}

export async function getPhotographerBookings(photographerId: string): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/bookings/photographer/${photographerId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  
  return response.json();
}

// Earnings API
export async function getPhotographerEarnings(photographerId: string): Promise<Earning[]> {
  const response = await fetch(`${API_BASE}/earnings/photographer/${photographerId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch earnings");
  }
  
  return response.json();
}

export async function getPhotographerEarningsSummary(photographerId: string): Promise<{
  total: number;
  pending: number;
  paid: number;
}> {
  const response = await fetch(`${API_BASE}/earnings/photographer/${photographerId}/summary`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch earnings summary");
  }
  
  return response.json();
}

// User Profile API
export async function updateUserProfile(data: { fullName?: string; phone?: string; profileImageUrl?: string }): Promise<User> {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }
  
  return response.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/me/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to change password");
  }
}

export async function getUserUploadUrl(): Promise<{ uploadUrl: { uploadURL: string; objectPath: string } }> {
  const response = await fetch(`${API_BASE}/users/me/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!response.ok) {
    throw new Error("Failed to get upload URL");
  }
  
  return response.json();
}

export async function setUserProfilePicture(imageURL: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/me/profile-picture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageURL }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to set profile picture");
  }
  
  return response.json();
}
