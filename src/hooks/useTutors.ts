import { useState, useEffect, useCallback } from 'react';
import { tutorFacade } from '@/services/facades/TutorFacade';
import { petFacade } from '@/services/facades/PetFacade';
import { apiClient } from '@/services/api/ApiClient';
import { Tutor, Pet, PaginatedResponse, getTutorId } from '@/types';

export function useTutors() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const subscription = tutorFacade.getState().subscribe((state) => {
      setTutors(state.tutors);
      setLoading(state.loading);
      setError(state.error);
      setTotalPages(state.pagination.totalPages);
      setTotalElements(state.pagination.totalElements);
      setCurrentPage(state.pagination.page);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadTutors = useCallback(async (page: number = 0, size: number = 10, nome?: string) => {
    await tutorFacade.loadTutors(page, size, nome);
  }, []);

  const searchTutors = useCallback(async (nome: string) => {
    await tutorFacade.loadTutors(0, 10, nome);
  }, []);

  const createTutor = useCallback(async (tutorData: Omit<Tutor, 'id'>, photo?: File) => {
    const newTutor = await tutorFacade.createTutor(tutorData);
    if (newTutor && photo) {
      await tutorFacade.uploadPhoto(newTutor.id, photo);
    }
    return newTutor;
  }, []);

  const nextPage = useCallback(async () => {
    if (currentPage < totalPages - 1) {
      await tutorFacade.loadTutors(currentPage + 1, 10);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(async () => {
    if (currentPage > 0) {
      await tutorFacade.loadTutors(currentPage - 1, 10);
    }
  }, [currentPage]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 0 && page < totalPages) {
      await tutorFacade.loadTutors(page, 10);
    }
  }, [totalPages]);

  const clearError = useCallback(() => {
    tutorFacade.clearError();
  }, []);

  return {
    tutors,
    loading,
    error,
    totalPages,
    totalElements,
    currentPage,
    loadTutors,
    searchTutors,
    createTutor,
    nextPage,
    previousPage,
    goToPage,
    clearError,
  };
}

export function useTutor(id?: number | string) {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [tutorPets, setTutorPets] = useState<Pet[]>([]);
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = tutorFacade.getState().subscribe((state) => {
      setTutor(state.currentTutor);
      setTutorPets(state.tutorPets);
      setLoading(state.loading);
      setError(state.error);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      tutorFacade.getTutorById(id);
    }
  }, [id]);

  // Carregar pets disponíveis para vincular
  // Busca todos os tutores para identificar quais pets já estão vinculados
  const loadAvailablePets = useCallback(async () => {
    try {
      // Busca todos os pets
      await petFacade.loadPets(0, 1000);
      const petState = petFacade.getCurrentState();
      const allPets = petState.pets;

      // Busca todos os tutores para ver quais pets já estão vinculados
      const tutorsResponse = await apiClient.get<PaginatedResponse<Tutor>>('/v1/tutores', {
        params: { page: 0, size: 1000 }
      });
      const allTutors = tutorsResponse.data.content || [];

      // Cria um Set com todos os IDs de pets que já estão vinculados a algum tutor
      const linkedPetIds = new Set<string>();
      
      for (const t of allTutors) {
        if (t.pets && Array.isArray(t.pets)) {
          for (const pet of t.pets) {
            linkedPetIds.add(String(pet.id));
          }
        }
      }

      // Também verifica se o pet tem tutorId definido
      const available = allPets.filter((pet) => {
        const petIdStr = String(pet.id);
        const isLinked = linkedPetIds.has(petIdStr);
        const hasTutorId = getTutorId(pet) !== null;
        
        // Pet disponível se não estiver vinculado a nenhum tutor
        return !isLinked && !hasTutorId;
      });

      // Pets disponíveis carregados
      setAvailablePets(available);
    } catch (error) {
      console.error('Erro ao carregar pets disponíveis:', error);
      setAvailablePets([]);
    }
  }, []);

  const loadTutor = useCallback(async (tutorId: number | string) => {
    return await tutorFacade.getTutorById(tutorId);
  }, []);

  const createTutor = useCallback(async (tutorData: Omit<Tutor, 'id'>, photo?: File) => {
    const newTutor = await tutorFacade.createTutor(tutorData);
    if (newTutor && photo) {
      await tutorFacade.uploadPhoto(newTutor.id, photo);
    }
    return newTutor;
  }, []);

  const updateTutor = useCallback(async (tutorId: number | string, tutorData: Partial<Tutor>, photo?: File) => {
    const updatedTutor = await tutorFacade.updateTutor(tutorId, tutorData);
    if (updatedTutor && photo) {
      await tutorFacade.uploadPhoto(tutorId, photo);
    }
    return updatedTutor;
  }, []);

  const deleteTutor = useCallback(async (tutorId: number | string) => {
    return await tutorFacade.deleteTutor(tutorId);
  }, []);

  const uploadPhoto = useCallback(async (tutorId: number | string, file: File) => {
    return await tutorFacade.uploadPhoto(tutorId, file);
  }, []);

  const linkPet = useCallback(async (tutorId: number | string, petId: number | string) => {
    const result = await tutorFacade.linkPetToTutor(tutorId, petId);
    if (result) {
      // Recarrega os pets disponíveis após vincular
      await loadAvailablePets();
    }
    return result;
  }, [loadAvailablePets]);

  const unlinkPet = useCallback(async (tutorId: number | string, petId: number | string) => {
    const result = await tutorFacade.unlinkPetFromTutor(tutorId, petId);
    if (result) {
      // Recarrega os pets disponíveis após desvincular
      await loadAvailablePets();
    }
    return result;
  }, [loadAvailablePets]);

  const clearTutor = useCallback(() => {
    tutorFacade.clearCurrentTutor();
  }, []);

  const clearError = useCallback(() => {
    tutorFacade.clearError();
  }, []);

  return {
    tutor,
    tutorPets,
    availablePets,
    loading,
    error,
    loadTutor,
    createTutor,
    updateTutor,
    deleteTutor,
    uploadPhoto,
    linkPet,
    unlinkPet,
    loadAvailablePets,
    clearTutor,
    clearError,
  };
}
