import { Pet, Tutor } from '../../types';

const STORAGE_KEYS = {
  PETS: 'petmanager_pets',
  TUTORS: 'petmanager_tutors',
  AUTH: 'petmanager_auth',
};

export interface StoredPet extends Pet {
  id: number;
  urlFoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredTutor extends Tutor {
  id: number;
  urlFoto?: string;
  petIds: number[];
  createdAt: string;
  updatedAt: string;
}

class LocalStorageService {
  private static instance: LocalStorageService;
  private petIdCounter: number = 1;
  private tutorIdCounter: number = 1;

  private constructor() {
    this.initializeCounters();
  }

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private initializeCounters(): void {
    const pets = this.getPets();
    const tutors = this.getTutors();
    
    if (pets.length > 0) {
      this.petIdCounter = Math.max(...pets.map(p => p.id)) + 1;
    }
    if (tutors.length > 0) {
      this.tutorIdCounter = Math.max(...tutors.map(t => t.id)) + 1;
    }
  }

  // ============ PETS ============

  getPets(): StoredPet[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  savePets(pets: StoredPet[]): void {
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
  }

  getPetById(id: number): StoredPet | null {
    const pets = this.getPets();
    return pets.find(p => p.id === id) || null;
  }

  addPet(pet: Omit<Pet, 'id'>): StoredPet {
    const pets = this.getPets();
    const now = new Date().toISOString();
    
    const newPet: StoredPet = {
      ...pet,
      id: this.petIdCounter++,
      createdAt: now,
      updatedAt: now,
    };
    
    pets.push(newPet);
    this.savePets(pets);
    
    return newPet;
  }

  updatePet(id: number, updates: Partial<Pet>): StoredPet | null {
    const pets = this.getPets();
    const index = pets.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    pets[index] = {
      ...pets[index],
      ...updates,
      id, // Garantir que o ID não mude
      updatedAt: new Date().toISOString(),
    };
    
    this.savePets(pets);
    return pets[index];
  }

  deletePet(id: number): boolean {
    const pets = this.getPets();
    const index = pets.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    pets.splice(index, 1);
    this.savePets(pets);
    
    // Remover vínculo com tutores
    const tutors = this.getTutors();
    tutors.forEach(tutor => {
      const petIndex = tutor.petIds.indexOf(id);
      if (petIndex !== -1) {
        tutor.petIds.splice(petIndex, 1);
      }
    });
    this.saveTutors(tutors);
    
    return true;
  }

  getPetsPaginated(page: number, size: number, nome?: string): { content: StoredPet[]; totalPages: number; totalElements: number } {
    let pets = this.getPets();
    
    // Filtrar por nome se fornecido
    if (nome) {
      const searchTerm = nome.toLowerCase();
      pets = pets.filter(p => p.nome.toLowerCase().includes(searchTerm));
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    pets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const totalElements = pets.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = pets.slice(start, start + size);
    
    return { content, totalPages, totalElements };
  }

  updatePetPhoto(id: number, photoBase64: string): StoredPet | null {
    return this.updatePet(id, { urlFoto: photoBase64 } as Partial<Pet>);
  }

  // ============ TUTORS ============

  getTutors(): StoredTutor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TUTORS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveTutors(tutors: StoredTutor[]): void {
    localStorage.setItem(STORAGE_KEYS.TUTORS, JSON.stringify(tutors));
  }

  getTutorById(id: number): StoredTutor | null {
    const tutors = this.getTutors();
    return tutors.find(t => t.id === id) || null;
  }

  addTutor(tutor: Omit<Tutor, 'id'>): StoredTutor {
    const tutors = this.getTutors();
    const now = new Date().toISOString();
    
    const newTutor: StoredTutor = {
      ...tutor,
      id: this.tutorIdCounter++,
      petIds: [],
      createdAt: now,
      updatedAt: now,
    };
    
    tutors.push(newTutor);
    this.saveTutors(tutors);
    
    return newTutor;
  }

  updateTutor(id: number, updates: Partial<Tutor>): StoredTutor | null {
    const tutors = this.getTutors();
    const index = tutors.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    tutors[index] = {
      ...tutors[index],
      ...updates,
      id, // Garantir que o ID não mude
      updatedAt: new Date().toISOString(),
    };
    
    this.saveTutors(tutors);
    return tutors[index];
  }

  deleteTutor(id: number): boolean {
    const tutors = this.getTutors();
    const index = tutors.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    // Remover vínculo dos pets
    const tutor = tutors[index];
    if (tutor.petIds.length > 0) {
      const pets = this.getPets();
      tutor.petIds.forEach(petId => {
        const pet = pets.find(p => p.id === petId);
        if (pet) {
          pet.tutorId = undefined;
        }
      });
      this.savePets(pets);
    }
    
    tutors.splice(index, 1);
    this.saveTutors(tutors);
    
    return true;
  }

  getTutorsPaginated(page: number, size: number, nome?: string): { content: StoredTutor[]; totalPages: number; totalElements: number } {
    let tutors = this.getTutors();
    
    // Filtrar por nome se fornecido
    if (nome) {
      const searchTerm = nome.toLowerCase();
      tutors = tutors.filter(t => t.nome.toLowerCase().includes(searchTerm));
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    tutors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const totalElements = tutors.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const content = tutors.slice(start, start + size);
    
    return { content, totalPages, totalElements };
  }

  updateTutorPhoto(id: number, photoBase64: string): StoredTutor | null {
    return this.updateTutor(id, { urlFoto: photoBase64 } as Partial<Tutor>);
  }

  // ============ VINCULAÇÃO PET-TUTOR ============

  linkPetToTutor(tutorId: number, petId: number): boolean {
    const tutors = this.getTutors();
    const pets = this.getPets();
    
    const tutorIndex = tutors.findIndex(t => t.id === tutorId);
    const petIndex = pets.findIndex(p => p.id === petId);
    
    if (tutorIndex === -1 || petIndex === -1) return false;
    
    // Remover pet de outro tutor se vinculado
    tutors.forEach(t => {
      const idx = t.petIds.indexOf(petId);
      if (idx !== -1) {
        t.petIds.splice(idx, 1);
      }
    });
    
    // Adicionar ao novo tutor
    if (!tutors[tutorIndex].petIds.includes(petId)) {
      tutors[tutorIndex].petIds.push(petId);
    }
    
    // Atualizar pet com tutorId
    pets[petIndex].tutorId = tutorId;
    
    this.saveTutors(tutors);
    this.savePets(pets);
    
    return true;
  }

  unlinkPetFromTutor(tutorId: number, petId: number): boolean {
    const tutors = this.getTutors();
    const pets = this.getPets();
    
    const tutorIndex = tutors.findIndex(t => t.id === tutorId);
    const petIndex = pets.findIndex(p => p.id === petId);
    
    if (tutorIndex === -1) return false;
    
    const petIdIndex = tutors[tutorIndex].petIds.indexOf(petId);
    if (petIdIndex !== -1) {
      tutors[tutorIndex].petIds.splice(petIdIndex, 1);
    }
    
    if (petIndex !== -1) {
      pets[petIndex].tutorId = undefined;
      this.savePets(pets);
    }
    
    this.saveTutors(tutors);
    
    return true;
  }

  getPetsByTutorId(tutorId: number): StoredPet[] {
    const tutor = this.getTutorById(tutorId);
    if (!tutor) return [];
    
    const pets = this.getPets();
    return pets.filter(p => tutor.petIds.includes(p.id));
  }

  getAvailablePetsForTutor(): StoredPet[] {
    const pets = this.getPets();
    return pets.filter(p => !p.tutorId);
  }

  // ============ AUTH (para manter compatibilidade) ============

  getAuth(): { token: string; user: { username: string } } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveAuth(auth: { token: string; user: { username: string } }): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  }

  clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  // ============ ESTATÍSTICAS ============

  getStats(): { totalPets: number; totalTutors: number; linkedPets: number } {
    const pets = this.getPets();
    const tutors = this.getTutors();
    const linkedPets = pets.filter(p => p.tutorId).length;
    
    return {
      totalPets: pets.length,
      totalTutors: tutors.length,
      linkedPets,
    };
  }

  // ============ LIMPEZA ============

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PETS);
    localStorage.removeItem(STORAGE_KEYS.TUTORS);
    this.petIdCounter = 1;
    this.tutorIdCounter = 1;
  }
}

export const localStorageService = LocalStorageService.getInstance();
