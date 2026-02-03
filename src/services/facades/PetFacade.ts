import { BehaviorSubject, Observable } from 'rxjs';
import { apiClient } from '../api/ApiClient';
import { Pet, Tutor, PaginatedResponse } from '../../types';

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  currentPetTutor: Tutor | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}

const initialState: PetState = {
  pets: [],
  currentPet: null,
  currentPetTutor: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  },
};

class PetFacade {
  private state$ = new BehaviorSubject<PetState>(initialState);

  getState(): Observable<PetState> {
    return this.state$.asObservable();
  }

  getCurrentState(): PetState {
    return this.state$.getValue();
  }

  private setState(newState: Partial<PetState>): void {
    this.state$.next({ ...this.state$.getValue(), ...newState });
  }

  async loadPets(page: number = 0, size: number = 10, nome?: string): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const params: Record<string, string | number> = { page, size };
      if (nome) {
        params.nome = nome;
      }

      const response = await apiClient.get<PaginatedResponse<Pet>>('/v1/pets', { params });
      const data = response.data;

      this.setState({
        pets: data.content || [],
        loading: false,
        pagination: {
          page: data.page || page,
          size: data.size || size,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        },
      });
    } catch (error: any) {
      console.error('Erro ao carregar pets:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao carregar pets',
      });
    }
  }

  /**
   * Extrai o ID do tutor da resposta do pet, verificando múltiplos formatos
   */
  private extractTutorId(pet: any): number | string | null {
    // Verifica campos diretos de ID
    if (pet.tutorId) return pet.tutorId;
    if (pet.tutor_id) return pet.tutor_id;
    if (pet.idTutor) return pet.idTutor;
    if (pet.id_tutor) return pet.id_tutor;
    
    // Verifica objetos aninhados
    if (pet.tutor?.id) return pet.tutor.id;
    if (pet.responsavel?.id) return pet.responsavel.id;
    if (pet.dono?.id) return pet.dono.id;
    if (pet.owner?.id) return pet.owner.id;
    
    return null;
  }

  /**
   * Extrai o objeto Tutor da resposta do pet, verificando múltiplos formatos
   */
  private extractTutor(pet: any): Tutor | null {
    if (pet.tutor && typeof pet.tutor === 'object' && pet.tutor.id) {
      return pet.tutor as Tutor;
    }
    if (pet.responsavel && typeof pet.responsavel === 'object' && pet.responsavel.id) {
      return pet.responsavel as Tutor;
    }
    if (pet.dono && typeof pet.dono === 'object' && pet.dono.id) {
      return pet.dono as Tutor;
    }
    if (pet.owner && typeof pet.owner === 'object' && pet.owner.id) {
      return pet.owner as Tutor;
    }
    return null;
  }

  async getPetById(id: number | string): Promise<Pet | null> {
    this.setState({ loading: true, error: null, currentPetTutor: null });

    try {
      const response = await apiClient.get<Pet>(`/v1/pets/${id}`);
      const pet = response.data;
      
      // Pet carregado com sucesso
      
      // Verifica se o tutor já está embutido na resposta
      let tutor = this.extractTutor(pet);
      
      // Se não estiver embutido, tenta buscar pelo ID
      if (!tutor) {
        const tutorId = this.extractTutorId(pet);
        // Tutor ID identificado
        
        if (tutorId) {
          try {
            const tutorResponse = await apiClient.get<Tutor>(`/v1/tutores/${tutorId}`);
            tutor = tutorResponse.data;
            // Tutor carregado com sucesso
          } catch (tutorError) {
            console.error('Erro ao carregar tutor:', tutorError);
          }
        }
      }
      
      this.setState({ currentPet: pet, currentPetTutor: tutor, loading: false });
      return pet;
    } catch (error: any) {
      console.error('Erro ao carregar pet:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao carregar pet',
      });
      return null;
    }
  }

  /**
   * Busca o tutor vinculado a um pet verificando na lista de tutores
   */
  async findTutorForPet(petId: number | string): Promise<Tutor | null> {
    try {
      // Carrega todos os tutores para verificar qual tem esse pet vinculado
      const response = await apiClient.get<PaginatedResponse<Tutor>>('/v1/tutores', { 
        params: { page: 0, size: 1000 } 
      });
      
      const tutors = response.data.content || [];
      
      for (const tutor of tutors) {
        if (tutor.pets && Array.isArray(tutor.pets)) {
          const hasPet = tutor.pets.some(p => 
            p.id === petId || 
            String(p.id) === String(petId)
          );
          if (hasPet) {
            // Tutor encontrado
            return tutor;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar tutor para o pet:', error);
      return null;
    }
  }

  async createPet(petData: Omit<Pet, 'id'>): Promise<Pet | null> {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.post<Pet>('/v1/pets', petData);
      const newPet = response.data;

      const currentPets = this.state$.getValue().pets;
      this.setState({
        pets: [newPet, ...currentPets],
        loading: false,
      });

      return newPet;
    } catch (error: any) {
      console.error('Erro ao criar pet:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao criar pet',
      });
      return null;
    }
  }

  async updatePet(id: number | string, petData: Partial<Pet>): Promise<Pet | null> {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.put<Pet>(`/v1/pets/${id}`, petData);
      const updatedPet = response.data;

      const currentPets = this.state$.getValue().pets;
      this.setState({
        pets: currentPets.map((p) => (p.id === id ? updatedPet : p)),
        currentPet: updatedPet,
        loading: false,
      });

      return updatedPet;
    } catch (error: any) {
      console.error('Erro ao atualizar pet:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao atualizar pet',
      });
      return null;
    }
  }

  async deletePet(id: number | string): Promise<boolean> {
    this.setState({ loading: true, error: null });

    try {
      await apiClient.delete(`/v1/pets/${id}`);

      const currentPets = this.state$.getValue().pets;
      this.setState({
        pets: currentPets.filter((p) => p.id !== id),
        loading: false,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir pet:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao excluir pet',
      });
      return false;
    }
  }

  async uploadPhoto(petId: number | string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await apiClient.post(`/v1/pets/${petId}/fotos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const photoUrl = response.data.url || response.data.foto || response.data;

      // Atualiza o pet com a nova foto
      const currentPets = this.state$.getValue().pets;
      const currentPet = this.state$.getValue().currentPet;

      if (currentPet && currentPet.id === petId) {
        this.setState({
          currentPet: { ...currentPet, foto: photoUrl },
        });
      }

      this.setState({
        pets: currentPets.map((p) =>
          p.id === petId ? { ...p, foto: photoUrl } : p
        ),
      });

      return photoUrl;
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      return null;
    }
  }

  clearError(): void {
    this.setState({ error: null });
  }

  clearCurrentPet(): void {
    this.setState({ currentPet: null, currentPetTutor: null });
  }
}

export const petFacade = new PetFacade();
