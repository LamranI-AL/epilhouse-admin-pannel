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
import { updateAgent, getAgentById } from "./agents";
import { updateService, getServiceById } from "./services";
import { LocationWithAgents } from "@/types";

// CREATE: Add a new location
export async function addLocation(data: LocationWithAgents) {
  const {
    name,
    address,
    city,
    // postalCode,
    // country,
    // location,
    phone,
    email,
    coordinates,
    workingHours,
    isActive,
    assignedAgents,
    assignedServices,
  } = data;

  const newLocation = {
    name,
    address,
    city,
    // postalCode,
    // country,
    // location,
    phone,
    email,
    coordinates,
    workingHours: workingHours as any,
    isActive: isActive as any,
    assignedAgents: assignedAgents || [],
    assignedServices: assignedServices || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const locationRef = collection(db, "locations");
    const docRef = await addDoc(locationRef, newLocation);

    console.log("Location créée avec l'ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all locations
export async function getAllLocations() {
  try {
    const locationRef = collection(db, "locations");
    const querySnapshot = await getDocs(locationRef);

    const locations: LocationWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      console.log("Document ID trouvé:", doc.id);

      const locationData = {
        id: doc.id,
        ...doc.data(),
      };

      console.log("Données de la location avant sérialisation:", locationData);

      locations.push(locationData as any);
    });

    console.log("Total locations trouvées:", locations.length);
    return { success: true, locations };
  } catch (error) {
    console.error("Error getting locations:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get location by ID
export async function getLocationById(id: string) {
  try {
    const locationRef = doc(db, "locations", id);
    const docSnap = await getDoc(locationRef);

    if (docSnap.exists()) {
      const locationData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      return {
        success: true,
        location: locationData as any,
      };
    } else {
      return { success: false, error: "Location not found" };
    }
  } catch (error) {
    console.error("Error getting location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get active locations
export async function getActiveLocations() {
  try {
    const locationRef = collection(db, "locations");
    const q = query(locationRef, where("isActive", "==", true));
    const querySnapshot = await getDocs(q);

    const locations: LocationWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const locationData = {
        id: doc.id,
        ...doc.data(),
      };

      locations.push(locationData as any);
    });

    return { success: true, locations };
  } catch (error) {
    console.error("Error getting active locations:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get locations by city
export async function getLocationsByCity(city: string) {
  try {
    const locationRef = collection(db, "locations");
    const q = query(locationRef, where("city", "==", city));
    const querySnapshot = await getDocs(q);

    const locations: LocationWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const locationData = {
        id: doc.id,
        ...doc.data(),
      };

      locations.push(locationData as any);
    });

    return { success: true, locations };
  } catch (error) {
    console.error("Error getting locations by city:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get locations by agent ID
export async function getLocationsByAgentId(agentId: string) {
  try {
    const locationRef = collection(db, "locations");
    const querySnapshot = await getDocs(locationRef);

    const locations: LocationWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const rawLocationData = doc.data();

      const isAgentAssigned = rawLocationData.assignedAgents?.some(
        (agent: {
          id: string;
          firstName: string;
          lastName: string;
          displayName: string | null;
        }) => agent.id === agentId,
      );

      if (isAgentAssigned) {
        const locationData = {
          id: doc.id,
          ...rawLocationData,
        };

        locations.push(locationData as any);
      }
    });

    return { success: true, locations };
  } catch (error) {
    console.error("Error getting locations by agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a location
export async function updateLocation(
  id: string,
  data: Partial<LocationWithAgents>,
) {
  try {
    const locationRef = doc(db, "locations", id);
    await updateDoc(locationRef, {
      ...data,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Toggle location availability
export async function toggleLocationAvailability(
  id: string,
  isActive: boolean,
) {
  try {
    const locationRef = doc(db, "locations", id);
    await updateDoc(locationRef, {
      isActive: isActive,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling location availability:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ASSIGN: Assign agent to location (bidirectional)
export async function assignAgentToLocation(
  locationId: string,
  agentId: string,
) {
  try {
    // 1. Récupérer les données de la location
    const locationResult = await getLocationById(locationId);
    if (!locationResult.success || !locationResult.location) {
      return { success: false, error: "Location not found" };
    }

    // 2. Récupérer les données de l'agent
    const agentResult = await getAgentById(agentId);
    if (!agentResult.success || !agentResult.agent) {
      return { success: false, error: "Agent not found" };
    }

    const location = locationResult.location;
    const agent = agentResult.agent;

    // 3. Vérifier si l'agent n'est pas déjà assigné à la location
    const isAlreadyAssigned = location.assignedAgents?.some(
      (assignedAgent: any) => assignedAgent.id === agentId,
    );

    if (isAlreadyAssigned) {
      return {
        success: false,
        error: "Agent already assigned to this location",
      };
    }

    // 4. Ajouter l'agent à la location
    const updatedAssignedAgents = [
      ...(location.assignedAgents || []),
      {
        id: agent.id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        displayName: agent.displayName,
      },
    ];

    const locationUpdateResult = await updateLocation(locationId, {
      assignedAgents: updatedAssignedAgents as any,
    });

    if (!locationUpdateResult.success) {
      return locationUpdateResult;
    }

    // 5. Ajouter la location à l'agent (relation bidirectionnelle)
    const updatedAssignedLocations = [
      ...(agent.assignedLocations || []),
      {
        id: locationId,
        name: location.name,
        city: location.city,
      },
    ];

    const agentUpdateResult = await updateAgent(agentId, {
      assignedLocations: updatedAssignedLocations as any,
    });

    if (!agentUpdateResult.success) {
      // Rollback de la location si la mise à jour de l'agent échoue
      await updateLocation(locationId, {
        assignedAgents: location.assignedAgents,
      });
      return agentUpdateResult;
    }

    return { success: true };
  } catch (error) {
    console.error("Error assigning agent to location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// REMOVE: Remove agent from location (bidirectional)
export async function removeAgentFromLocation(
  locationId: string,
  agentId: string,
) {
  try {
    // 1. Récupérer les données de la location
    const locationResult = await getLocationById(locationId);
    if (!locationResult.success || !locationResult.location) {
      return { success: false, error: "Location not found" };
    }

    // 2. Récupérer les données de l'agent
    const agentResult = await getAgentById(agentId);
    if (!agentResult.success || !agentResult.agent) {
      return { success: false, error: "Agent not found" };
    }

    const location = locationResult.location;
    const agent = agentResult.agent;

    // 3. Retirer l'agent de la location
    const updatedAssignedAgents =
      location.assignedAgents?.filter(
        (assignedAgent: any) => assignedAgent.id !== agentId,
      ) || [];

    const locationUpdateResult = await updateLocation(locationId, {
      assignedAgents: updatedAssignedAgents,
    });

    if (!locationUpdateResult.success) {
      return locationUpdateResult;
    }

    // 4. Retirer la location de l'agent (relation bidirectionnelle)
    const updatedAssignedLocations =
      agent.assignedLocations?.filter(
        (assignedLocation: any) => assignedLocation.id !== locationId,
      ) || [];

    const agentUpdateResult = await updateAgent(agentId, {
      assignedLocations: updatedAssignedLocations,
    });

    if (!agentUpdateResult.success) {
      // Rollback de la location si la mise à jour de l'agent échoue
      await updateLocation(locationId, {
        assignedAgents: location.assignedAgents,
      });
      return agentUpdateResult;
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing agent from location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ASSIGN: Assign service to location (bidirectional)
// export async function assignServiceToLocation(
//   locationId: string,
//   serviceId: string,
// ) {
//   try {
//     // 1. Récupérer les données de la location
//     const locationResult = await getLocationById(locationId);
//     if (!locationResult.success || !locationResult.location) {
//       return { success: false, error: "Location not found" };
//     }

//     // 2. Récupérer les données du service
//     const serviceResult = await getServiceById(serviceId);
//     if (!serviceResult.success || !serviceResult.service) {
//       return { success: false, error: "Service not found" };
//     }

//     const location = locationResult.location;
//     const service = serviceResult.service;

//     // 3. Vérifier si le service n'est pas déjà assigné à la location
//     const isAlreadyAssigned = location.assignedServices?.some(
//       (assignedService: any) => assignedService.id === serviceId,
//     );

//     if (isAlreadyAssigned) {
//       return {
//         success: false,
//         error: "Service already assigned to this location",
//       };
//     }

//     // 4. Ajouter le service à la location
//     const updatedAssignedServices = [
//       ...(location.assignedServices || []),
//       {
//         id: service.id,
//         name: service.name,
//         color: service.color,
//       },
//     ];

//     const locationUpdateResult = await updateLocation(locationId, {
//       assignedServices: updatedAssignedServices as any,
//     });

//     if (!locationUpdateResult.success) {
//       return locationUpdateResult;
//     }

//     // 5. Ajouter la location au service (relation bidirectionnelle)
//     const updatedAssignedLocations = [
//       ...(service.assignedLocations || []),
//       {
//         id: locationId,
//         name: location.name,
//         city: location.city,
//       },
//     ];

//     const serviceUpdateResult = await updateService(serviceId, {
//       assignedLocations: updatedAssignedLocations as any,
//     });

//     if (!serviceUpdateResult.success) {
//       // Rollback de la location si la mise à jour du service échoue
//       await updateLocation(locationId, {
//         assignedServices: location.assignedServices,
//       });
//       return serviceUpdateResult;
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Error assigning service to location:", error);
//     return { success: false, error: (error as Error).message };
//   }
// }

// REMOVE: Remove service from location (bidirectional)
// export async function removeServiceFromLocation(
//   locationId: string,
//   serviceId: string,
// ) {
//   try {
//     // 1. Récupérer les données de la location
//     const locationResult = await getLocationById(locationId);
//     if (!locationResult.success || !locationResult.location) {
//       return { success: false, error: "Location not found" };
//     }

//     // 2. Récupérer les données du service
//     const serviceResult = await getServiceById(serviceId);
//     if (!serviceResult.success || !serviceResult.service) {
//       return { success: false, error: "Service not found" };
//     }

//     const location = locationResult.location;
//     const service = serviceResult.service;

//     // 3. Retirer le service de la location
//     const updatedAssignedServices =
//       location.assignedServices?.filter(
//         (assignedService: any) => assignedService.id !== serviceId,
//       ) || [];

//     const locationUpdateResult = await updateLocation(locationId, {
//       assignedServices: updatedAssignedServices,
//     });

//     if (!locationUpdateResult.success) {
//       return locationUpdateResult;
//     }

//     // 4. Retirer la location du service (relation bidirectionnelle)
//     const updatedAssignedLocations =
//       service.assignedLocations?.filter(
//         (assignedLocation: any) => assignedLocation.id !== locationId,
//       ) || [];

//     const serviceUpdateResult = await updateService(serviceId, {
//       assignedLocations: updatedAssignedLocations,
//     });

//     if (!serviceUpdateResult.success) {
//       // Rollback de la location si la mise à jour du service échoue
//       await updateLocation(locationId, {
//         assignedServices: location.assignedServices,
//       });
//       return serviceUpdateResult;
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Error removing service from location:", error);
//     return { success: false, error: (error as Error).message };
//   }
// }

// DELETE: Delete a location
export async function deleteLocation(id: string) {
  try {
    // 1. Récupérer la location pour obtenir les agents et services assignés
    const locationResult = await getLocationById(id);
    if (locationResult.success && locationResult.location) {
      const location = locationResult.location;

      // 2. Retirer cette location de tous les agents assignés
      if (location.assignedAgents && location.assignedAgents.length > 0) {
        for (const assignedAgent of location.assignedAgents) {
          try {
            const agentResult = await getAgentById(assignedAgent.id as any);
            if (agentResult.success && agentResult.agent) {
              const updatedAssignedLocations =
                agentResult.agent.assignedLocations?.filter(
                  (assignedLocation: any) => assignedLocation.id !== id,
                ) || [];

              await updateAgent(assignedAgent.id as any, {
                assignedLocations: updatedAssignedLocations,
              });
            }
          } catch (error) {
            console.error(`Error updating agent ${assignedAgent.id}:`, error);
          }
        }
      }

      // 3. Retirer cette location de tous les services assignés
      if (location.assignedServices && location.assignedServices.length > 0) {
        for (const assignedService of location.assignedServices) {
          try {
            const serviceResult = await getServiceById(
              assignedService.id as any,
            );
            if (serviceResult.success && serviceResult.service) {
              //   const updatedAssignedLocations =
              //     serviceResult.service.assignedLocations?.filter(
              //       (assignedLocation: any) => assignedLocation.id !== id,
              //     ) || [];
              //   await updateService(assignedService.id as any, {
              //     assignedLocations: updatedAssignedLocations,
              //   });
            }
          } catch (error) {
            console.error(
              `Error updating service ${assignedService.id}:`,
              error,
            );
          }
        }
      }
    }

    // 4. Supprimer la location
    const locationRef = doc(db, "locations", id);
    await deleteDoc(locationRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting location:", error);
    return { success: false, error: (error as Error).message };
  }
}

// SEARCH: Search locations by name, city or address
export async function searchLocations(searchTerm: string) {
  try {
    const locationRef = collection(db, "locations");
    const querySnapshot = await getDocs(locationRef);

    const locations: LocationWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const rawLocationData = doc.data();

      if (
        rawLocationData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rawLocationData.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rawLocationData.address.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        const locationData = {
          id: doc.id,
          ...rawLocationData,
        };

        locations.push(locationData as any);
      }
    });

    return { success: true, locations };
  } catch (error) {
    console.error("Error searching locations:", error);
    return { success: false, error: (error as Error).message };
  }
}

// GEOCODING: Get coordinates from address using Google Maps API
export async function getCoordinatesFromAddress(
  address: string,
  city: string,
  country: string,
) {
  try {
    const fullAddress = `${address}, ${city}, ${country}`;
    const apiKey = "";

    if (!apiKey) {
      return { success: false, error: "Google Maps API key not configured" };
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress,
      )}&key=${apiKey}`,
    );

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        // location: {
        //   latitude: location.lat,
        //   longitude: location.lng,
        // },
      };
    } else {
      return { success: false, error: "Address not found" };
    }
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return { success: false, error: (error as Error).message };
  }
}

// GET: Get location statistics
export async function getLocationStatistics() {
  try {
    const locationRef = collection(db, "locations");
    const querySnapshot = await getDocs(locationRef);

    let totalLocations = 0;
    let activeLocations = 0;
    let totalAssignedAgents = 0;
    let totalAssignedServices = 0;
    const cityCounts: { [key: string]: number } = {};

    querySnapshot.forEach((doc) => {
      const locationData = doc.data();
      totalLocations++;

      if (locationData.isActive) {
        activeLocations++;
      }

      totalAssignedAgents += locationData.assignedAgents?.length || 0;
      totalAssignedServices += locationData.assignedServices?.length || 0;

      const city = locationData.city || "Unknown";
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return {
      success: true,
      statistics: {
        totalLocations,
        activeLocations,
        inactiveLocations: totalLocations - activeLocations,
        totalAssignedAgents,
        totalAssignedServices,
        averageAgentsPerLocation:
          totalLocations > 0 ? totalAssignedAgents / totalLocations : 0,
        averageServicesPerLocation:
          totalLocations > 0 ? totalAssignedServices / totalLocations : 0,
        cityCounts,
      },
    };
  } catch (error) {
    console.error("Error getting location statistics:", error);
    return { success: false, error: (error as Error).message };
  }
}
