/** @format */
"use server";

import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookingFormData, BookingWithDetails } from "@/types";

// ========== QUICK BOOKINGS ==========
// CREATE: Add a new quick booking
export async function addQuickBooking(data: BookingFormData) {
  const newQuickBooking = {
    ...data,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const quickBookingRef = collection(db, "quickBookings");
    const docRef = await addDoc(quickBookingRef, newQuickBooking);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding quick booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all quick bookings
export async function getAllQuickBookings() {
  try {
    const quickBookingRef = collection(db, "quickBookings");
    const querySnapshot = await getDocs(quickBookingRef);

    const quickBookings: any[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      quickBookings.push(bookingData);
    });

    return { success: true, quickBookings };
  } catch (error) {
    console.error("Error getting quick bookings:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get quick booking by ID
export async function getQuickBookingById(id: string) {
  try {
    const quickBookingRef = doc(db, "quickBookings", id);
    const docSnap = await getDoc(quickBookingRef);

    if (docSnap.exists()) {
      const bookingData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      return { success: true, quickBooking: bookingData };
    } else {
      return { success: false, error: "Quick booking not found" };
    }
  } catch (error) {
    console.error("Error getting quick booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get quick bookings by status
export async function getQuickBookingsByStatus(status: string) {
  try {
    const quickBookingRef = collection(db, "quickBookings");
    const q = query(quickBookingRef, where("status", "==", status));
    const querySnapshot = await getDocs(q);

    const quickBookings: any[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      quickBookings.push(bookingData);
    });

    return { success: true, quickBookings };
  } catch (error) {
    console.error("Error getting quick bookings by status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update quick booking status
export async function updateQuickBookingStatus(id: string, status: string) {
  try {
    const quickBookingRef = doc(db, "quickBookings", id);
    await updateDoc(quickBookingRef, {
      status: status,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating quick booking status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a quick booking
export async function deleteQuickBooking(id: string) {
  try {
    const quickBookingRef = doc(db, "quickBookings", id);
    await deleteDoc(quickBookingRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting quick booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ========== DETAILED BOOKINGS ==========

// CREATE: Add a new detailed booking
export async function addBooking(data: Partial<BookingWithDetails>) {
  const newBooking = {
    startTime: data.startTime || "",
    endTime: data.endTime || "",
    status: data.status || "pending",
    notes: data.notes || null,
    totalAmount: data.totalAmount || "0",
    service: data.service || [],
    agents: data.agent || [],
    client: data.client || {
      id: 0,
      firstName: "",
      lastName: "",
      email: "",
      phone: null,
    },
    location: data.location || {
      id: 0,
      name: "",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const bookingRef = collection(db, "bookings");
    const docRef = await addDoc(bookingRef, newBooking);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all bookings
export async function getAllBookings() {
  try {
    const bookingRef = collection(db, "bookings");
    const querySnapshot = await getDocs(bookingRef);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      bookings.push(bookingData as any);
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error getting bookings:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get booking by ID
export async function getBookingById(id: string) {
  try {
    const bookingRef = doc(db, "bookings", id);
    const docSnap = await getDoc(bookingRef);

    if (docSnap.exists()) {
      const bookingData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      return { success: true, booking: bookingData as any };
    } else {
      return { success: false, error: "Booking not found" };
    }
  } catch (error) {
    console.error("Error getting booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get bookings by client email
export async function getBookingsByClientEmail(email: string) {
  try {
    const bookingRef = collection(db, "bookings");
    const q = query(bookingRef, where("client.email", "==", email));
    const querySnapshot = await getDocs(q);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      bookings.push(bookingData as any);
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error getting bookings by client email:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get bookings by location ID
export async function getBookingsByLocationId(locationId: number) {
  try {
    const bookingRef = collection(db, "bookings");
    const q = query(bookingRef, where("location.id", "==", locationId));
    const querySnapshot = await getDocs(q);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      bookings.push(bookingData as any);
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error getting bookings by location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get bookings by agent ID
export async function getBookingsByAgentId(agentId: number) {
  try {
    const bookingRef = collection(db, "bookings");
    const q = query(bookingRef, where("agent.id", "==", agentId));
    const querySnapshot = await getDocs(q);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      bookings.push(bookingData as any);
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error getting bookings by agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get bookings by status
export async function getBookingsByStatus(status: string) {
  try {
    const bookingRef = collection(db, "bookings");
    const q = query(bookingRef, where("status", "==", status));
    const querySnapshot = await getDocs(q);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      bookings.push(bookingData as any);
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error getting bookings by status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get bookings by date range
export async function getBookingsByDateRange(
  startDate: string,
  endDate: string,
) {
  try {
    const bookingRef = collection(db, "bookings");
    const q = query(
      bookingRef,
      where("startTime", ">=", startDate),
      where("startTime", "<=", endDate),
      orderBy("startTime"),
    );
    const querySnapshot = await getDocs(q);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      bookings.push(bookingData as any);
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error getting bookings by date range:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a booking
export async function updateBooking(id: string, data: any) {
  try {
    const bookingRef = doc(db, "quickBookings", id);
    await updateDoc(bookingRef, {
      ...data,
      // updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update booking status
export async function updateBookingStatus(id: string, status: string) {
  try {
    const bookingRef = doc(db, "quickBookings", id);
    await updateDoc(bookingRef, {
      status: status,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a booking
export async function deleteBooking(id: string) {
  try {
    const bookingRef = doc(db, "bookings", id);
    await deleteDoc(bookingRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// CONVERT: Convert quick booking to detailed booking
export async function convertQuickBookingToBooking(
  quickBookingId: string,
  additionalData: {
    agentId?: number;
    agentFirstName?: string;
    agentLastName?: string;
    agentDisplayName?: string;
    locationId?: number;
    locationName?: string;
    serviceId?: number;
    serviceName?: string;
    serviceColor?: string;
    serviceDuration?: number;
  },
) {
  try {
    // Get quick booking
    const quickBookingResult = await getQuickBookingById(quickBookingId);
    if (!quickBookingResult.success) {
      return { success: false, error: "Quick booking not found" };
    }

    const quickBooking = quickBookingResult.quickBooking as any;

    // Create detailed booking
    const detailedBooking: Partial<BookingWithDetails | any> = {
      startTime: `${quickBooking?.selectedDate}T${quickBooking?.selectedTime}:00`,
      endTime: quickBooking?.selectedTime, // Vous pouvez calculer l'heure de fin
      status: "confirmed",
      notes: quickBooking?.notes || null,
      totalAmount: quickBooking?.totalAmount.toString(),
      service: {
        name: additionalData.serviceName || "",
        color: additionalData.serviceColor || "",
        duration: additionalData.serviceDuration || 0,
      },
      agent: {
        firstName: additionalData.agentFirstName || "",
        lastName: additionalData.agentLastName || "",
        displayName: additionalData.agentDisplayName || null,
      },
      client: {
        firstName: quickBooking.clientFirstName,
        lastName: quickBooking.clientLastName,
        email: quickBooking.clientEmail,
        phone: quickBooking.clientPhone || null,
      },
      location: {
        id: additionalData.locationId || quickBooking.locationId || 0,
        name: additionalData.locationName || "",
      },
    };

    // Add detailed booking
    const addResult = await addBooking(detailedBooking);
    if (!addResult.success) {
      return { success: false, error: "Failed to create detailed booking" };
    }

    // Update quick booking status to converted
    await updateQuickBookingStatus(quickBookingId, "converted");

    return { success: true, bookingId: addResult.id };
  } catch (error) {
    console.error("Error converting quick booking:", error);
    return { success: false, error: (error as Error).message };
  }
}

// SEARCH: Search bookings by client name or email
export async function searchBookings(searchTerm: string) {
  try {
    const bookingRef = collection(db, "bookings");
    const querySnapshot = await getDocs(bookingRef);

    const bookings: BookingWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const rawBookingData = doc.data();
      const clientFullName = `${rawBookingData.client?.firstName || ""} ${
        rawBookingData.client?.lastName || ""
      }`.toLowerCase();
      const clientEmail = rawBookingData.client?.email?.toLowerCase() || "";

      if (
        clientFullName.includes(searchTerm.toLowerCase()) ||
        clientEmail.includes(searchTerm.toLowerCase())
      ) {
        const bookingData = {
          id: doc.id,
          ...rawBookingData,
        };
        bookings.push(bookingData as any);
      }
    });

    return { success: true, bookings };
  } catch (error) {
    console.error("Error searching bookings:", error);
    return { success: false, error: (error as Error).message };
  }
}
// READ: Get quick bookings by client email
export async function getQuickBookingsByEmail(email: string) {
  try {
    const quickBookingRef = collection(db, "quickBookings");
    const q = query(quickBookingRef, where("clientEmail", "==", email));
    const querySnapshot = await getDocs(q);

    const quickBookings: any[] = [];
    querySnapshot.forEach((doc) => {
      const bookingData = {
        id: doc.id,
        ...doc.data(),
      };
      quickBookings.push(bookingData);
    });

    return { success: true, quickBookings };
  } catch (error) {
    console.error("Error getting quick bookings by email:", error);
    return { success: false, error: (error as Error).message };
  }
}
