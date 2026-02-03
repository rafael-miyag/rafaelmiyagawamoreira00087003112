import { apiClient } from './ApiClient';
import { Pet, PetFormData, PetPage, Tutor, TutorFormData, TutorPage } from '@/types';

// Helper para normalizar resposta de paginação
function normalizePage<T>(data: any): { content: T[]; totalPages: number; totalElements: number; number: number } {
  // Se já está no formato esperado
  if (data.content && Array.isArray(data.content)) {
    return {
      content: data.content,
      totalPages: data.totalPages || data.total_pages || Math.ceil((data.totalElements || data.total || data.content.length) / 10),
      totalElements: data.totalElements || data.total_elements || data.total || data.content.length,
      number: data.number || data.page || 0,
    };
  }
  
  // Se é um array direto
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
    };
  }
  
  // Se tem outro formato (data, items, etc)
  const content = data.data || data.items || data.results || data.records || [];
  return {
    content: Array.isArray(content) ? content : [],
    totalPages: data.totalPages || data.total_pages || data.pages || 1,
    totalElements: data.totalElements || data.total_elements || data.total || content.length,
    number: data.number || data.page || data.currentPage || 0,
  };
}

// Helper para normalizar Pet
function normalizePet(data: any): Pet {
  return {
    id: data.id,
    nome: data.nome || data.name || '',
    especie: data.especie || data.species || data.tipo || '',
    raca: data.raca || data.breed || data.raça || '',
    idade: data.idade || data.age || 0,
    tutorId: data.tutorId || data.tutor_id || data.idTutor || data.tutor?.id,
    tutor: data.tutor || data.responsavel || data.dono || data.owner,
    urlFoto: data.urlFoto || data.fotoUrl || data.photoUrl || data.foto || data.image || data.imagem,
    fotos: data.fotos || data.photos || data.imagens || data.images || [],
  };
}

// Helper para normalizar Tutor
function normalizeTutor(data: any): Tutor {
  const pets = data.pets || data.animals || data.animais || [];
  return {
    id: data.id,
    nome: data.nome || data.name || data.nomeCompleto || '',
    telefone: data.telefone || data.phone || data.celular || data.contato || '',
    endereco: data.endereco || data.address || data.endereço || '',
    urlFoto: data.urlFoto || data.fotoUrl || data.photoUrl || data.foto || data.image || data.imagem,
    fotos: data.fotos || data.photos || data.imagens || data.images || [],
    pets: Array.isArray(pets) ? pets.map(normalizePet) : [],
  };
}

// Pet API Endpoints
export const petApi = {
  async getAll(page: number = 0, size: number = 10, nome?: string): Promise<PetPage> {
    let url = `/v1/pets?page=${page}&size=${size}`;
    if (nome && nome.trim()) {
      url += `&nome=${encodeURIComponent(nome.trim())}`;
    }
    
    const response = await apiClient.get(url);
    const normalized = normalizePage<Pet>(response.data);
    
    return {
      content: normalized.content.map(normalizePet),
      totalPages: normalized.totalPages,
      totalElements: normalized.totalElements,
      number: normalized.number,
    };
  },

  async getById(id: number | string): Promise<Pet> {
    const response = await apiClient.get(`/v1/pets/${id}`);
    return normalizePet(response.data);
  },

  async create(data: PetFormData): Promise<Pet> {
    const payload = {
      nome: data.nome,
      especie: data.especie,
      raca: data.raca || '',
      idade: typeof data.idade === 'string' ? parseInt(data.idade, 10) : data.idade,
    };
    
    const response = await apiClient.post('/v1/pets', payload);
    return normalizePet(response.data);
  },

  async update(id: number | string, data: PetFormData): Promise<Pet> {
    const payload = {
      nome: data.nome,
      especie: data.especie,
      raca: data.raca || '',
      idade: typeof data.idade === 'string' ? parseInt(data.idade, 10) : data.idade,
    };
    
    const response = await apiClient.put(`/v1/pets/${id}`, payload);
    return normalizePet(response.data);
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/v1/pets/${id}`);
  },

  async uploadPhoto(id: number | string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('file', file);
    formData.append('image', file);
    
    const response = await apiClient.post(`/v1/pets/${id}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Tenta extrair URL da resposta em diferentes formatos
    const data = response.data;
    return data.url || data.urlFoto || data.fotoUrl || data.path || data.link || data || '';
  },
};

// Tutor API Endpoints
export const tutorApi = {
  async getAll(page: number = 0, size: number = 10, nome?: string): Promise<TutorPage> {
    let url = `/v1/tutores?page=${page}&size=${size}`;
    if (nome && nome.trim()) {
      url += `&nome=${encodeURIComponent(nome.trim())}`;
    }
    
    const response = await apiClient.get(url);
    const normalized = normalizePage<Tutor>(response.data);
    
    return {
      content: normalized.content.map(normalizeTutor),
      totalPages: normalized.totalPages,
      totalElements: normalized.totalElements,
      number: normalized.number,
    };
  },

  async getById(id: number | string): Promise<Tutor> {
    const response = await apiClient.get(`/v1/tutores/${id}`);
    return normalizeTutor(response.data);
  },

  async create(data: TutorFormData): Promise<Tutor> {
    const payload = {
      nome: data.nome,
      telefone: data.telefone || '',
      endereco: data.endereco || '',
    };
    
    const response = await apiClient.post('/v1/tutores', payload);
    return normalizeTutor(response.data);
  },

  async update(id: number | string, data: TutorFormData): Promise<Tutor> {
    const payload = {
      nome: data.nome,
      telefone: data.telefone || '',
      endereco: data.endereco || '',
    };
    
    const response = await apiClient.put(`/v1/tutores/${id}`, payload);
    return normalizeTutor(response.data);
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/v1/tutores/${id}`);
  },

  async uploadPhoto(id: number | string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('file', file);
    formData.append('image', file);
    
    const response = await apiClient.post(`/v1/tutores/${id}/fotos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = response.data;
    return data.url || data.urlFoto || data.fotoUrl || data.path || data.link || data || '';
  },

  async linkPet(tutorId: number | string, petId: number | string): Promise<void> {
    await apiClient.post(`/v1/tutores/${tutorId}/pets/${petId}`);
  },

  async unlinkPet(tutorId: number | string, petId: number | string): Promise<void> {
    await apiClient.delete(`/v1/tutores/${tutorId}/pets/${petId}`);
  },

  async getPets(tutorId: number | string): Promise<Pet[]> {
    try {
      const response = await apiClient.get(`/v1/tutores/${tutorId}/pets`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.map(normalizePet);
      }
      
      if (data.content && Array.isArray(data.content)) {
        return data.content.map(normalizePet);
      }
      
      return [];
    } catch (error) {
      console.error(`[tutorApi] Error getting pets for tutor ${tutorId}:`, error);
      return [];
    }
  },

  async getAvailablePets(): Promise<Pet[]> {
    try {
      // Busca todos os pets
      const allPetsResponse = await petApi.getAll(0, 1000);
      const allPets = allPetsResponse.content;
      
      // Busca todos os tutores para ver quais pets já estão vinculados
      const allTutorsResponse = await tutorApi.getAll(0, 1000);
      const allTutors = allTutorsResponse.content;
      
      // Coleta IDs de pets que já estão vinculados a algum tutor
      const linkedPetIds = new Set<number | string>();
      
      for (const tutor of allTutors) {
        if (tutor.pets && Array.isArray(tutor.pets)) {
          for (const pet of tutor.pets) {
            if (pet.id) {
              linkedPetIds.add(pet.id);
            }
          }
        }
      }
      
      // Filtra pets que não estão vinculados
      const availablePets = allPets.filter(pet => {
        // Se o pet tem tutorId, está vinculado
        if (pet.tutorId) return false;
        
        // Se o pet está na lista de vinculados, está vinculado
        if (linkedPetIds.has(pet.id)) return false;
        
        return true;
      });
      
      console.log(`[tutorApi] Available pets: ${availablePets.length} of ${allPets.length} total`);
      
      return availablePets;
    } catch (error) {
      console.error('[tutorApi] Error getting available pets:', error);
      return [];
    }
  },
};

// Auth API Endpoints
export const authApi = {
  async login(username: string, password: string): Promise<{ token: string; refreshToken?: string }> {
    const response = await apiClient.post('/autenticacao/login', {
      username,
      password,
    });
    
    const data = response.data;
    
    // Tenta extrair token de diferentes formatos
    const token = data.token || data.accessToken || data.access_token || data.jwt || data.bearer;
    const refreshToken = data.refreshToken || data.refresh_token || data.refresh;
    
    if (!token) {
      // Talvez o token esteja no header
      const authHeader = response.headers['authorization'] || response.headers['Authorization'];
      if (authHeader) {
        const bearerToken = authHeader.replace('Bearer ', '');
        return { token: bearerToken, refreshToken };
      }
      
      throw new Error('Token não encontrado na resposta');
    }
    
    return { token, refreshToken };
  },

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    const response = await apiClient.put('/autenticacao/refresh', {
      refreshToken,
    });
    
    const data = response.data;
    
    return {
      token: data.token || data.accessToken || data.access_token,
      refreshToken: data.refreshToken || data.refresh_token || refreshToken,
    };
  },
};

// Health API Endpoints
export const healthApi = {
  async check(): Promise<{ status: 'UP' | 'DOWN' }> {
    try {
      const response = await apiClient.get('/q/health');
      return { status: response.data.status === 'UP' ? 'UP' : 'DOWN' };
    } catch {
      return { status: 'DOWN' };
    }
  },

  async live(): Promise<boolean> {
    try {
      await apiClient.get('/q/health/live');
      return true;
    } catch {
      return false;
    }
  },

  async ready(): Promise<boolean> {
    try {
      await apiClient.get('/q/health/ready');
      return true;
    } catch {
      return false;
    }
  },
};
