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
// import {
//   serializeFirebaseData,
//   serializeFirebaseDocument,
// } from "@/utils/serializeData";
import { AgentWithDetails } from "@/types";

// CREATE: Add a new agent
export async function addAgent(data: any) {
  const {
    firstName,
    lastName,
    displayName,
    email,
    phone,
    title,
    role,
    bio,
    workingDays,
    workingHours,
    highlights,
    status,
    isOnLeave,
    totalBookings,
    assignedLocations,
    assignedServices,
  } = data;

  const newAgent = {
    firstName,
    lastName,
    displayName,
    email,
    phone,
    title,
    role,
    bio,
    workingDays,
    workingHours,
    highlights,
    status,
    isOnLeave,
    totalBookings,
    assignedLocations,
    assignedServices,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const agentRef = collection(db, "agents");
    const docRef = await addDoc(agentRef, data);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all agents
export async function getAllAgents() {
  try {
    const agentRef = collection(db, "agents");
    const querySnapshot = await getDocs(agentRef);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const agentData = {
        id: doc.id,
        ...doc.data(),
      };

      agents.push(agentData as any);
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error getting agents:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get agent by ID
export async function getAgentById(id: string) {
  try {
    const agentRef = doc(db, "agents", id);
    const docSnap = await getDoc(agentRef);

    if (docSnap.exists()) {
      const agentData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      return {
        success: true,
        agent: agentData as AgentWithDetails,
      };
    } else {
      return { success: false, error: "Agent not found" };
    }
  } catch (error) {
    console.error("Error getting agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get agents by location ID
export async function getAgentsByLocationId(locationId: number) {
  try {
    const agentRef = collection(db, "agents");
    const querySnapshot = await getDocs(agentRef);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const rawAgentData = doc.data();

      // Vérifier si l'agent est assigné à cette localisation
      const isAssignedToLocation = rawAgentData.assignedLocations?.some(
        (location: { id: number; name: string }) => location.id === locationId,
      );

      if (isAssignedToLocation) {
        const agentData = {
          id: doc.id,
          ...rawAgentData,
        };

        agents.push(agentData as AgentWithDetails);
      }
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error getting agents by location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get agents by service ID
export async function getAgentsByServiceId(serviceId: number) {
  try {
    const agentRef = collection(db, "agents");
    const querySnapshot = await getDocs(agentRef);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const rawAgentData = doc.data();

      // Vérifier si l'agent est assigné à ce service
      const isAssignedToService = rawAgentData.assignedServices?.some(
        (service: { id: number; name: string; color: string }) =>
          service.id === serviceId,
      );

      if (isAssignedToService) {
        const agentData = {
          id: doc.id,
          ...rawAgentData,
        };

        agents.push(agentData as AgentWithDetails);
      }
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error getting agents by service:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get agents by status
export async function getAgentsByStatus(status: string) {
  try {
    const agentRef = collection(db, "agents");
    const q = query(agentRef, where("status", "==", status));
    const querySnapshot = await getDocs(q);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const agentData = {
        id: doc.id,
        ...doc.data(),
      };

      agents.push(agentData as AgentWithDetails);
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error getting agents by status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get available agents (not on leave and active status)
export async function getAvailableAgents() {
  try {
    const agentRef = collection(db, "agents");
    const q = query(
      agentRef,
      where("isOnLeave", "==", false),
      where("status", "==", "active"),
    );
    const querySnapshot = await getDocs(q);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const agentData = {
        id: doc.id,
        ...doc.data(),
      };

      agents.push(agentData as AgentWithDetails);
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error getting available agents:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get top agents by total bookings
export async function getTopAgentsByBookings(limitCount: number = 10) {
  try {
    const agentRef = collection(db, "agents");
    const q = query(
      agentRef,
      orderBy("totalBookings", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const agentData = {
        id: doc.id,
        ...doc.data(),
      };

      agents.push(agentData as AgentWithDetails);
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error getting top agents by bookings:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update an agent
export async function updateAgent(id: string, data: Partial<AgentWithDetails>) {
  try {
    const agentRef = doc(db, "agents", id);
    await updateDoc(agentRef, {
      ...data,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Toggle agent leave status
export async function toggleAgentLeaveStatus(id: string, isOnLeave: boolean) {
  try {
    const agentRef = doc(db, "agents", id);
    await updateDoc(agentRef, {
      isOnLeave: isOnLeave,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling agent leave status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update agent status
export async function updateAgentStatus(id: string, status: string) {
  try {
    const agentRef = doc(db, "agents", id);
    await updateDoc(agentRef, {
      status: status,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating agent status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Add location to agent
export async function addLocationToAgent(
  id: string,
  location: { id: number; name: string },
) {
  try {
    const agentRef = doc(db, "agents", id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return { success: false, error: "Agent not found" };
    }

    const agentData = agentSnap.data();
    const assignedLocations = agentData.assignedLocations || [];

    // Vérifier si la localisation n'est pas déjà assignée
    const locationExists = assignedLocations.some(
      (loc: { id: number; name: string }) => loc.id === location.id,
    );

    if (locationExists) {
      return {
        success: false,
        error: "Location already assigned to this agent",
      };
    }

    await updateDoc(agentRef, {
      assignedLocations: [...assignedLocations, location],
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding location to agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Add service to agent
export async function addServiceToAgent(
  id: string,
  service: { id: number; name: string; color: string },
) {
  try {
    const agentRef = doc(db, "agents", id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return { success: false, error: "Agent not found" };
    }

    const agentData = agentSnap.data();
    const assignedServices = agentData.assignedServices || [];

    // Vérifier si le service n'est pas déjà assigné
    const serviceExists = assignedServices.some(
      (srv: { id: number; name: string; color: string }) =>
        srv.id === service.id,
    );

    if (serviceExists) {
      return {
        success: false,
        error: "Service already assigned to this agent",
      };
    }

    await updateDoc(agentRef, {
      assignedServices: [...assignedServices, service],
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding service to agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Remove location from agent
export async function removeLocationFromAgent(id: string, locationId: number) {
  try {
    const agentRef = doc(db, "agents", id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return { success: false, error: "Agent not found" };
    }

    const agentData = agentSnap.data();
    const assignedLocations = agentData.assignedLocations || [];

    const updatedLocations = assignedLocations.filter(
      (location: { id: number; name: string }) => location.id !== locationId,
    );

    await updateDoc(agentRef, {
      assignedLocations: updatedLocations,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing location from agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Remove service from agent
export async function removeServiceFromAgent(id: string, serviceId: number) {
  try {
    const agentRef = doc(db, "agents", id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return { success: false, error: "Agent not found" };
    }

    const agentData = agentSnap.data();
    const assignedServices = agentData.assignedServices || [];

    const updatedServices = assignedServices.filter(
      (service: { id: number; name: string; color: string }) =>
        service.id !== serviceId,
    );

    await updateDoc(agentRef, {
      assignedServices: updatedServices,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing service from agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Increment total bookings
export async function incrementAgentBookings(id: string) {
  try {
    const agentRef = doc(db, "agents", id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return { success: false, error: "Agent not found" };
    }

    const agentData = agentSnap.data();
    const currentBookings = agentData.totalBookings || 0;

    await updateDoc(agentRef, {
      totalBookings: currentBookings + 1,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error incrementing agent bookings:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete an agent
export async function deleteAgent(id: string) {
  try {
    const agentRef = doc(db, "agents", id);
    await deleteDoc(agentRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// SEARCH: Search agents by name or email
export async function searchAgents(searchTerm: string) {
  try {
    const agentRef = collection(db, "agents");
    const querySnapshot = await getDocs(agentRef);

    const agents: AgentWithDetails[] = [];
    querySnapshot.forEach((doc) => {
      const rawAgentData = doc.data();
      const fullName =
        `${rawAgentData.firstName} ${rawAgentData.lastName}`.toLowerCase();
      const email = rawAgentData.email?.toLowerCase() || "";
      const displayName = rawAgentData.displayName?.toLowerCase() || "";

      if (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        displayName.includes(searchTerm.toLowerCase())
      ) {
        const agentData = {
          id: doc.id,
          ...rawAgentData,
        };

        agents.push(agentData as AgentWithDetails);
      }
    });

    return { success: true, agents };
  } catch (error) {
    console.error("Error searching agents:", error);
    return { success: false, error: (error as Error).message };
  }
}
