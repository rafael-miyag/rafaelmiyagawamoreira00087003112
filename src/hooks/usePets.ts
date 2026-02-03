import { useState, useEffect, useCallback } from 'react';
import { petFacade } from '../services/facades/PetFacade';
import { Pet, Tutor } from '../types';

interface UsePetsResult {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
  loadPets: (page?: number, size?: number, nome?: string) => Promise<void>;
  createPet: (data: Omit<Pet, 'id'>, photo?: File) => Promise<Pet | null>;
  updatePet: (id: number | string, data: Partial<Pet>, photo?: File) => Promise<Pet | null>;
  deletePet: (id: number | string) => Promise<boolean>;
  clearError: () => void;
}

export function usePets(): UsePetsResult {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  useEffect(() => {
    const subscription = petFacade.getState().subscribe((state) => {
      setPets(state.pets);
      setLoading(state.loading);
      setError(state.error);
      setPagination(state.pagination);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPets = useCallback(async (page?: number, size?: number, nome?: string) => {
    await petFacade.loadPets(page, size, nome);
  }, []);

  const createPet = useCallback(async (data: Omit<Pet, 'id'>, photo?: File): Promise<Pet | null> => {
    const pet = await petFacade.createPet(data);
    if (pet && photo) {
      await petFacade.uploadPhoto(pet.id, photo);
    }
    return pet;
  }, []);

  const updatePet = useCallback(async (id: number | string, data: Partial<Pet>, photo?: File): Promise<Pet | null> => {
    const pet = await petFacade.updatePet(id, data);
    if (pet && photo) {
      await petFacade.uploadPhoto(id, photo);
    }
    return pet;
  }, []);

  const deletePet = useCallback(async (id: number | string): Promise<boolean> => {
    return await petFacade.deletePet(id);
  }, []);

  const clearError = useCallback(() => {
    petFacade.clearError();
  }, []);

  return {
    pets,
    loading,
    error,
    pagination,
    loadPets,
    createPet,
    updatePet,
    deletePet,
    clearError,
  };
}

interface UsePetResult {
  pet: Pet | null;
  tutor: Tutor | null;
  loading: boolean;
  error: string | null;
  loadPet: (id: number | string) => Promise<void>;
  updatePet: (id: number | string, data: Partial<Pet>, photo?: File) => Promise<Pet | null>;
  deletePet: (id: number | string) => Promise<boolean>;
  findTutorForPet: (petId: number | string) => Promise<Tutor | null>;
}

export function usePet(id?: number | string): UsePetResult {
  const [pet, setPet] = useState<Pet | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = petFacade.getState().subscribe((state) => {
      setPet(state.currentPet);
      setTutor(state.currentPetTutor);
      setLoading(state.loading);
      setError(state.error);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      loadPet(id);
    }
    
    return () => {
      petFacade.clearCurrentPet();
    };
  }, [id]);

  const loadPet = useCallback(async (petId: number | string) => {
    const loadedPet = await petFacade.getPetById(petId);
    
    // Se não encontrou tutor pelo pet, tenta buscar na lista de tutores
    if (loadedPet) {
      const state = petFacade.getCurrentState();
      if (!state.currentPetTutor) {
        console.log('Tutor não encontrado no pet, buscando na lista de tutores...');
        const foundTutor = await petFacade.findTutorForPet(petId);
        if (foundTutor) {
          setTutor(foundTutor);
        }
      }
    }
  }, []);

  const updatePet = useCallback(async (petId: number | string, data: Partial<Pet>, photo?: File): Promise<Pet | null> => {
    const updatedPet = await petFacade.updatePet(petId, data);
    if (updatedPet && photo) {
      await petFacade.uploadPhoto(petId, photo);
    }
    return updatedPet;
  }, []);

  const deletePet = useCallback(async (petId: number | string): Promise<boolean> => {
    return await petFacade.deletePet(petId);
  }, []);

  const findTutorForPet = useCallback(async (petId: number | string): Promise<Tutor | null> => {
    return await petFacade.findTutorForPet(petId);
  }, []);

  return {
    pet,
    tutor,
    loading,
    error,
    loadPet,
    updatePet,
    deletePet,
    findTutorForPet,
  };
}
