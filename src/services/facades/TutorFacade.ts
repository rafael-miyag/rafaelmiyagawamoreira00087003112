import { BehaviorSubject, Observable } from 'rxjs';
import { apiClient } from '../api/ApiClient';
import { Tutor, Pet, PaginatedResponse } from '../../types';

interface TutorState {
  tutors: Tutor[];
  currentTutor: Tutor | null;
  tutorPets: Pet[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}

const initialState: TutorState = {
  tutors: [],
  currentTutor: null,
  tutorPets: [],
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  },
};

class TutorFacade {
  private state$ = new BehaviorSubject<TutorState>(initialState);

  getState(): Observable<TutorState> {
    return this.state$.asObservable();
  }

  getCurrentState(): TutorState {
    return this.state$.getValue();
  }

  private setState(newState: Partial<TutorState>): void {
    this.state$.next({ ...this.state$.getValue(), ...newState });
  }

  async loadTutors(page: number = 0, size: number = 10, nome?: string): Promise<void> {
    this.setState({ loading: true, error: null });

    try {
      const params: Record<string, string | number> = { page, size };
      if (nome) {
        params.nome = nome;
      }

      const response = await apiClient.get<PaginatedResponse<Tutor>>('/v1/tutores', { params });
      const data = response.data;

      this.setState({
        tutors: data.content || [],
        loading: false,
        pagination: {
          page: data.page || page,
          size: data.size || size,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        },
      });
    } catch (error: any) {
      console.error('Erro ao carregar tutores:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao carregar tutores',
      });
    }
  }

  async getTutorById(id: number | string): Promise<Tutor | null> {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.get<Tutor>(`/v1/tutores/${id}`);
      const tutor = response.data;
      
      // Carregar os pets do tutor se existirem
      const tutorPets = tutor.pets || [];
      
      this.setState({ 
        currentTutor: tutor, 
        tutorPets,
        loading: false 
      });
      return tutor;
    } catch (error: any) {
      console.error('Erro ao carregar tutor:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao carregar tutor',
      });
      return null;
    }
  }

  async createTutor(tutorData: Omit<Tutor, 'id'>): Promise<Tutor | null> {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.post<Tutor>('/v1/tutores', tutorData);
      const newTutor = response.data;

      const currentTutors = this.state$.getValue().tutors;
      this.setState({
        tutors: [newTutor, ...currentTutors],
        loading: false,
      });

      return newTutor;
    } catch (error: any) {
      console.error('Erro ao criar tutor:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao criar tutor',
      });
      return null;
    }
  }

  async updateTutor(id: number | string, tutorData: Partial<Tutor>): Promise<Tutor | null> {
    this.setState({ loading: true, error: null });

    try {
      const response = await apiClient.put<Tutor>(`/v1/tutores/${id}`, tutorData);
      const updatedTutor = response.data;

      const currentTutors = this.state$.getValue().tutors;
      this.setState({
        tutors: currentTutors.map((t) => (t.id === id ? updatedTutor : t)),
        currentTutor: updatedTutor,
        loading: false,
      });

      return updatedTutor;
    } catch (error: any) {
      console.error('Erro ao atualizar tutor:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao atualizar tutor',
      });
      return null;
    }
  }

  async deleteTutor(id: number | string): Promise<boolean> {
    this.setState({ loading: true, error: null });

    try {
      await apiClient.delete(`/v1/tutores/${id}`);

      const currentTutors = this.state$.getValue().tutors;
      this.setState({
        tutors: currentTutors.filter((t) => t.id !== id),
        loading: false,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir tutor:', error);
      this.setState({
        loading: false,
        error: error.response?.data?.message || 'Erro ao excluir tutor',
      });
      return false;
    }
  }

  async uploadPhoto(tutorId: number | string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('foto', file);

      const response = await apiClient.post(`/v1/tutores/${tutorId}/fotos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const photoUrl = response.data.url || response.data.foto || response.data;

      // Atualiza o tutor com a nova foto
      const currentTutors = this.state$.getValue().tutors;
      const currentTutor = this.state$.getValue().currentTutor;

      if (currentTutor && currentTutor.id === tutorId) {
        this.setState({
          currentTutor: { ...currentTutor, foto: photoUrl },
        });
      }

      this.setState({
        tutors: currentTutors.map((t) =>
          t.id === tutorId ? { ...t, foto: photoUrl } : t
        ),
      });

      return photoUrl;
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      return null;
    }
  }

  async linkPetToTutor(tutorId: number | string, petId: number | string): Promise<boolean> {
    this.setState({ loading: true, error: null });

    try {
      // A API pode usar POST para vincular
      await apiClient.post(`/v1/tutores/${tutorId}/pets/${petId}`);

      // Recarrega o tutor para obter a lista atualizada de pets
      await this.getTutorById(tutorId);

      return true;
    } catch (error: any) {
      console.error('Erro ao vincular pet:', error);
      
      // Trata diferentes tipos de erro
      let errorMessage = 'Erro ao vincular pet ao tutor';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'Pet ou tutor não encontrado';
        } else if (status === 400) {
          errorMessage = data?.message || 'Pet já está vinculado a outro tutor';
        } else if (status === 409) {
          errorMessage = 'Conflito: Pet já está vinculado a este tutor';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      }
      
      this.setState({
        loading: false,
        error: errorMessage,
      });
      return false;
    }
  }

  async unlinkPetFromTutor(tutorId: number | string, petId: number | string): Promise<boolean> {
    this.setState({ loading: true, error: null });

    try {
      await apiClient.delete(`/v1/tutores/${tutorId}/pets/${petId}`);

      // Atualiza a lista local de pets do tutor
      const currentPets = this.state$.getValue().tutorPets;
      const currentTutor = this.state$.getValue().currentTutor;
      
      // Atualiza também a lista de pets do tutor atual
      if (currentTutor && currentTutor.pets) {
        currentTutor.pets = currentTutor.pets.filter((p) => p.id !== petId);
      }
      
      this.setState({
        tutorPets: currentPets.filter((p) => p.id !== petId),
        currentTutor: currentTutor,
        loading: false,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao desvincular pet:', error);
      
      let errorMessage = 'Erro ao desvincular pet do tutor';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'Vínculo não encontrado';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      }
      
      this.setState({
        loading: false,
        error: errorMessage,
      });
      return false;
    }
  }

  clearError(): void {
    this.setState({ error: null });
  }

  clearCurrentTutor(): void {
    this.setState({ currentTutor: null, tutorPets: [] });
  }
}

export const tutorFacade = new TutorFacade();
