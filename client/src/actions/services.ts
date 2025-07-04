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
import { updateAgent, getAgentById } from "./agents"; // Import des fonctions agents
import { ServiceWithAgents } from "@/types";

// CREATE: Add a new service
export async function addService(data: ServiceWithAgents | any) {
  // const {
  //   name,
  //   description,
  //   duration,
  //   price,
  //   capacity,
  //   category,
  //   color,
  //   isActive,
  //   assignedAgents,
  //   subServices,
  //   discountPrice,
  // } = data;

  // const newService = {
  //   name,
  //   description,

  //   price,
  //   capacity,
  //   category,
  //   color,
  //   isActive,
  //   subServices: {
  //     duration,
  //     price,
  //     discountPrice,
  //     description,
  //     name,
  //     color,
  //     isActive,
  //   },
  //   assignedAgents: assignedAgents || [],
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };

  try {
    const serviceRef = collection(db, "services");
    const docRef = await addDoc(serviceRef, data);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding service:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all services
export async function getAllServices() {
  try {
    const serviceRef = collection(db, "services");
    const querySnapshot = await getDocs(serviceRef);

    const services: ServiceWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const serviceData = {
        id: doc.id,
        ...doc.data(),
      };
      services.push(serviceData as ServiceWithAgents);
    });

    return { success: true, services };
  } catch (error) {
    console.error("Error getting services:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get service by ID
export async function getServiceById(id: string) {
  try {
    const serviceRef = doc(db, "services", id);
    const docSnap = await getDoc(serviceRef);

    if (docSnap.exists()) {
      const serviceData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      return {
        success: true,
        service: serviceData as ServiceWithAgents,
      };
    } else {
      return { success: false, error: "Service not found" };
    }
  } catch (error) {
    console.error("Error getting service:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get services by category
export async function getServicesByCategory(category: string) {
  try {
    const serviceRef = collection(db, "services");
    const q = query(serviceRef, where("category", "==", category));
    const querySnapshot = await getDocs(q);

    const services: ServiceWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const serviceData = {
        id: doc.id,
        ...doc.data(),
      };

      services.push(serviceData as ServiceWithAgents);
    });

    return { success: true, services };
  } catch (error) {
    console.error("Error getting services by category:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get services by agent ID
export async function getServicesByAgentId(agentId: string) {
  try {
    const serviceRef = collection(db, "services");
    const querySnapshot = await getDocs(serviceRef);

    const services: ServiceWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const rawServiceData = doc.data();

      // Vérifier si l'agent est assigné à ce service
      const isAgentAssigned = rawServiceData.assignedAgents?.some(
        (agent: {
          id: string;
          firstName: string;
          lastName: string;
          displayName: string | null;
        }) => agent.id === agentId,
      );

      if (isAgentAssigned) {
        const serviceData = {
          id: doc.id,
          ...rawServiceData,
        };

        services.push(serviceData as ServiceWithAgents);
      }
    });

    return { success: true, services };
  } catch (error) {
    console.error("Error getting services by agent:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get services by price range
export async function getServicesByPriceRange(
  minPrice: number,
  maxPrice: number,
) {
  try {
    const serviceRef = collection(db, "services");
    const querySnapshot = await getDocs(serviceRef);

    const services: ServiceWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const rawServiceData = doc.data();
      const servicePrice = parseFloat(
        rawServiceData.price.replace(/[^\d.-]/g, ""),
      );

      if (servicePrice >= minPrice && servicePrice <= maxPrice) {
        const serviceData = {
          id: doc.id,
          ...rawServiceData,
        };

        services.push(serviceData as ServiceWithAgents);
      }
    });

    return { success: true, services };
  } catch (error) {
    console.error("Error getting services by price range:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a service
export async function updateService(
  id: string,
  data: Partial<ServiceWithAgents>,
) {
  try {
    const serviceRef = doc(db, "services", id);
    await updateDoc(serviceRef, {
      ...data,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Toggle service availability
export async function toggleServiceAvailability(id: string, isActive: boolean) {
  try {
    const serviceRef = doc(db, "services", id);
    await updateDoc(serviceRef, {
      isActive: isActive,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling service availability:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ASSIGN: Assign agent to service (bidirectional)
export async function assignAgentToService(serviceId: string, agentId: string) {
  try {
    // 1. Récupérer les données du service
    const serviceResult = await getServiceById(serviceId);
    if (!serviceResult.success || !serviceResult.service) {
      return { success: false, error: "Service not found" };
    }

    // 2. Récupérer les données de l'agent
    const agentResult = await getAgentById(agentId);
    if (!agentResult.success || !agentResult.agent) {
      return { success: false, error: "Agent not found" };
    }

    const service = serviceResult.service;
    const agent = agentResult.agent;

    // 3. Vérifier si l'agent n'est pas déjà assigné au service
    const isAlreadyAssigned = service.assignedAgents?.some(
      (assignedAgent: any) => assignedAgent.id === agentId,
    );

    if (isAlreadyAssigned) {
      return {
        success: false,
        error: "Agent already assigned to this service",
      };
    }

    // 4. Vérifier la capacité du service
    if (
      service.assignedAgents
      // service.assignedAgents.length >= service.capacity
    ) {
      return { success: false, error: "Service has reached maximum capacity" };
    }

    // 5. Ajouter l'agent au service
    const updatedAssignedAgents = [
      ...(service.assignedAgents || []),
      {
        id: agent.id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        displayName: agent.displayName,
      },
    ];

    const serviceUpdateResult = await updateService(serviceId, {
      assignedAgents: updatedAssignedAgents as any,
    });

    if (!serviceUpdateResult.success) {
      return serviceUpdateResult;
    }

    // 6. Ajouter le service à l'agent (relation bidirectionnelle)
    // CORRECTION: Utiliser serviceId comme string au lieu de parseInt
    const updatedAssignedServices = [
      ...(agent.assignedServices || []),
      {
        id: serviceId, // Gardé comme string
        name: service.name,
        color: service.color,
      },
    ];

    const agentUpdateResult = await updateAgent(agentId, {
      assignedServices: updatedAssignedServices as any,
    });

    if (!agentUpdateResult.success) {
      // Rollback du service si la mise à jour de l'agent échoue
      await updateService(serviceId, {
        assignedAgents: service.assignedAgents,
      });
      return agentUpdateResult;
    }

    return { success: true };
  } catch (error) {
    console.error("Error assigning agent to service:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function removeAgentFromService(
  serviceId: string,
  agentId: string,
) {
  try {
    // 1. Récupérer les données du service
    const serviceResult = await getServiceById(serviceId);
    if (!serviceResult.success || !serviceResult.service) {
      return { success: false, error: "Service not found" };
    }

    // 2. Récupérer les données de l'agent
    const agentResult = await getAgentById(agentId);
    if (!agentResult.success || !agentResult.agent) {
      return { success: false, error: "Agent not found" };
    }

    const service = serviceResult.service;
    const agent = agentResult.agent;

    // 3. Retirer l'agent du service
    const updatedAssignedAgents =
      service.assignedAgents?.filter(
        (assignedAgent: any) => assignedAgent.id !== agentId,
      ) || [];

    const serviceUpdateResult = await updateService(serviceId, {
      assignedAgents: updatedAssignedAgents,
    });

    if (!serviceUpdateResult.success) {
      return serviceUpdateResult;
    }

    const updatedAssignedServices =
      agent.assignedServices?.filter(
        (assignedService: any) => assignedService.id !== serviceId,
      ) || [];

    const agentUpdateResult = await updateAgent(agentId, {
      assignedServices: updatedAssignedServices,
    });

    if (!agentUpdateResult.success) {
      // Rollback du service si la mise à jour de l'agent échoue
      await updateService(serviceId, {
        assignedAgents: service.assignedAgents,
      });
      return agentUpdateResult;
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing agent from service:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a service
export async function deleteService(id: string) {
  try {
    // 1. Récupérer le service pour obtenir les agents assignés
    const serviceResult = await getServiceById(id);
    if (serviceResult.success && serviceResult.service) {
      const service = serviceResult.service;

      // 2. Retirer ce service de tous les agents assignés
      if (service.assignedAgents && service.assignedAgents.length > 0) {
        for (const assignedAgent of service.assignedAgents) {
          try {
            const agentResult = await getAgentById(assignedAgent.id as any);
            if (agentResult.success && agentResult.agent) {
              const updatedAssignedServices =
                agentResult.agent.assignedServices?.filter(
                  (assignedService: any) => assignedService.id !== id, // Comparer avec id comme string
                ) || [];

              await updateAgent(assignedAgent.id as any, {
                assignedServices: updatedAssignedServices,
              });
            }
          } catch (error) {
            console.error(`Error updating agent ${assignedAgent.id}:`, error);
            // Continue with other agents even if one fails
          }
        }
      }
    }

    // 3. Supprimer le service
    const serviceRef = doc(db, "services", id);
    await deleteDoc(serviceRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: (error as Error).message };
  }
}

// SEARCH: Search services by name or description
export async function searchServices(searchTerm: string) {
  try {
    const serviceRef = collection(db, "services");
    const querySnapshot = await getDocs(serviceRef);

    const services: ServiceWithAgents[] = [];
    querySnapshot.forEach((doc) => {
      const rawServiceData = doc.data();

      if (
        rawServiceData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rawServiceData.description &&
          rawServiceData.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        rawServiceData.category.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        const serviceData = {
          id: doc.id,
          ...rawServiceData,
        };

        services.push(serviceData as ServiceWithAgents);
      }
    });

    return { success: true, services };
  } catch (error) {
    console.error("Error searching services:", error);
    return { success: false, error: (error as Error).message };
  }
}

// GET: Get service statistics
export async function getServiceStatistics() {
  try {
    const serviceRef = collection(db, "services");
    const querySnapshot = await getDocs(serviceRef);

    let totalServices = 0;
    let activeServices = 0;
    let totalCapacity = 0;
    let totalAssignedAgents = 0;
    const categoryCounts: { [key: string]: number } = {};

    querySnapshot.forEach((doc) => {
      const serviceData = doc.data();
      totalServices++;

      if (serviceData.isActive) {
        activeServices++;
      }

      totalCapacity += serviceData.capacity || 0;
      totalAssignedAgents += serviceData.assignedAgents?.length || 0;

      const category = serviceData.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return {
      success: true,
      statistics: {
        totalServices,
        activeServices,
        inactiveServices: totalServices - activeServices,
        totalCapacity,
        totalAssignedAgents,
        averageAgentsPerService:
          totalServices > 0 ? totalAssignedAgents / totalServices : 0,
        categoryCounts,
        utilizationRate:
          totalCapacity > 0 ? (totalAssignedAgents / totalCapacity) * 100 : 0,
      },
    };
  } catch (error) {
    console.error("Error getting service statistics:", error);
    return { success: false, error: (error as Error).message };
  }
}
export interface SubServiceResult {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  normalPrice: number;
  discountPrice: number;
  parentService: {
    id: string;
    name: string;
    color: string;
  };
}

// GET: Get sub-services by IDs
export async function getSubServicesByIds(subServiceIds: string[]) {
  try {
    if (!subServiceIds || subServiceIds.length === 0) {
      return {
        success: true,
        subServices: [],
        message: "Aucun ID de sous-service fourni",
      };
    }

    const serviceRef = collection(db, "services");
    const querySnapshot = await getDocs(serviceRef);

    const foundSubServices: SubServiceResult[] = [];
    const notFoundIds: string[] = [];

    // Parcourir tous les services pour trouver les sous-services correspondants
    querySnapshot.forEach((doc) => {
      const serviceData = doc.data() as ServiceWithAgents;
      const service = {
        // id: doc.id,
        ...serviceData,
      };

      // Vérifier si ce service contient des sous-services recherchés
      if (service.subServices && service.subServices.length > 0) {
        service.subServices.forEach((subService) => {
          if (subServiceIds.includes(subService.id)) {
            foundSubServices.push({
              id: subService.id,
              name: subService.name,
              description: subService.description,
              duration: subService.duration,
              normalPrice: subService.normalPrice,
              discountPrice: subService.discountPrice,
              parentService: {
                id: service.id,
                name: service.name,
                color: service.color,
              },
            });
          }
        });
      }
    });

    // Identifier les IDs non trouvés
    const foundIds = foundSubServices.map((sub) => sub.id);
    subServiceIds.forEach((id) => {
      if (!foundIds.includes(id)) {
        notFoundIds.push(id);
      }
    });

    return {
      success: true,
      subServices: foundSubServices,
      notFoundIds,
      totalRequested: subServiceIds.length,
      totalFound: foundSubServices.length,
    };
  } catch (error) {
    console.error("Error getting sub-services by IDs:", error);
    return {
      success: false,
      error: (error as Error).message,
      subServices: [],
    };
  }
}

/**
 * Version simplifiée qui retourne seulement les noms des sous-services et catégories
 * @param subServiceIds - Tableau des IDs des sous-services
 * @returns Tableau simplifié avec nom du sous-service et catégorie principale
 */
export async function getSubServiceNamesAndCategories(subServiceIds: string[]) {
  try {
    const result = await getSubServicesByIds(subServiceIds);

    if (!result.success) {
      return result;
    }

    const simplifiedResult = result.subServices.map((subService) => ({
      subServiceId: subService.id,
      subServiceName: subService.name,
      categoryId: subService.parentService.id,
      categoryName: subService.parentService.name,
      categoryColor: subService.parentService.color,
    }));

    return {
      success: true,
      data: simplifiedResult,
      notFoundIds: result.notFoundIds,
      totalRequested: result.totalRequested,
      totalFound: result.totalFound,
    };
  } catch (error) {
    console.error("Error getting sub-service names and categories:", error);
    // return {
    //   success: false,
    //   error: (error as Error).message,
    //   data: [],
    // };
  }
}
export async function getSubServiceNames(subServiceIds: string[]) {
  try {
    const result = await getSubServicesByIds(subServiceIds);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        names: [],
      };
    }

    const names = result.subServices.map((subService) => ({
      id: subService.id,
      name: subService.name,
      parentCategory: subService.parentService.name,
    }));

    return {
      success: true,
      names,
      notFoundIds: result.notFoundIds,
    };
  } catch (error) {
    console.error("Error getting sub-service names:", error);
    return {
      success: false,
      error: (error as Error).message,
      names: [],
    };
  }
}

export async function validateSubServiceIds(subServiceIds: string[]) {
  try {
    const result = await getSubServicesByIds(subServiceIds);

    if (!result.success) {
      return result;
    }

    const isValid = result.notFoundIds?.length === 0;

    return {
      success: true,
      isValid,
      validIds: result.subServices.map((sub) => sub.id),
      invalidIds: result.notFoundIds,
      details: {
        totalRequested: result.totalRequested,
        totalFound: result.totalFound,
        totalInvalid: result.notFoundIds?.length,
      },
    };
  } catch (error) {
    console.error("Error validating sub-service IDs:", error);
    return {
      success: false,
      error: (error as Error).message,
      isValid: false,
    };
  }
}

import { Service } from "@/types";

const COLLECTION_NAME = "services";

// export const getAllServices = async () => {
//   try {
//     const q = query(
//       collection(db, COLLECTION_NAME),
//       orderBy('name', 'asc')
//     );
//     const querySnapshot = await getDocs(q);

//     const services: Service[] = [];
//     querySnapshot.forEach((doc) => {
//       services.push({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate(),
//         updatedAt: doc.data().updatedAt?.toDate(),
//       } as Service);
//     });

//     return { success: true, services };
//   } catch (error) {
//     console.error('Error fetching services:', error);
//     return { success: false, error: 'Erreur lors du chargement des services' };
//   }
// };

// export const getServicesByCategory = async (categoryId: string) => {
//   try {
//     const q = query(
//       collection(db, COLLECTION_NAME),
//       where('categoryId', '==', categoryId),
//       orderBy('name', 'asc')
//     );
//     const querySnapshot = await getDocs(q);

//     const services: Service[] = [];
//     querySnapshot.forEach((doc) => {
//       services.push({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate(),
//         updatedAt: doc.data().updatedAt?.toDate(),
//       } as Service);
//     });

//     return { success: true, services };
//   } catch (error) {
//     console.error('Error fetching services by category:', error);
//     return { success: false, error: 'Erreur lors du chargement des services' };
//   }
// };

// export const getServiceById = async (id: string) => {
//   try {
//     const docRef = doc(db, COLLECTION_NAME, id);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const service = {
//         id: docSnap.id,
//         ...docSnap.data(),
//         createdAt: docSnap.data().createdAt?.toDate(),
//         updatedAt: docSnap.data().updatedAt?.toDate(),
//       } as Service;

//       return { success: true, service };
//     } else {
//       return { success: false, error: 'Service non trouvé' };
//     }
//   } catch (error) {
//     console.error('Error fetching service:', error);
//     return { success: false, error: 'Erreur lors du chargement du service' };
//   }
// };

// export const addService = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
//   try {
//     const docRef = await addDoc(collection(db, COLLECTION_NAME), {
//       ...serviceData,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     });

//     return { success: true, id: docRef.id };
//   } catch (error) {
//     console.error('Error adding service:', error);
//     return { success: false, error: 'Erreur lors de la création du service' };
//   }
// };

// export const updateService = async (id: string, serviceData: Partial<Service>) => {
//   try {
//     const docRef = doc(db, COLLECTION_NAME, id);
//     await updateDoc(docRef, {
//       ...serviceData,
//       updatedAt: serverTimestamp(),
//     });

//     return { success: true };
//   } catch (error) {
//     console.error('Error updating service:', error);
//     return { success: false, error: 'Erreur lors de la mise à jour du service' };
//   }
// };

// export const deleteService = async (id: string) => {
//   try {
//     const docRef = doc(db, COLLECTION_NAME, id);
//     await deleteDoc(docRef);

//     return { success: true };
//   } catch (error) {
//     console.error('Error deleting service:', error);
//     return { success: false, error: 'Erreur lors de la suppression du service' };
//   }
// };
