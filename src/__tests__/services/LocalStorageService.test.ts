import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageService } from '../../services/storage/LocalStorageService';

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorageService.clearAll();
  });

  describe('Pets', () => {
    it('should add and retrieve pets', () => {
      const pet = localStorageService.addPet({
        nome: 'Rex',
        especie: 'Cachorro',
        raca: 'Labrador',
        idade: 3,
      });

      expect(pet.id).toBeDefined();
      expect(pet.nome).toBe('Rex');
      
      const retrieved = localStorageService.getPetById(pet.id);
      expect(retrieved).toEqual(pet);
    });

    it('should update pet', () => {
      const pet = localStorageService.addPet({
        nome: 'Rex',
        especie: 'Cachorro',
      });

      const updated = localStorageService.updatePet(pet.id, { nome: 'Max' });
      
      expect(updated?.nome).toBe('Max');
      expect(updated?.especie).toBe('Cachorro');
    });

    it('should delete pet', () => {
      const pet = localStorageService.addPet({
        nome: 'Rex',
        especie: 'Cachorro',
      });

      const result = localStorageService.deletePet(pet.id);
      
      expect(result).toBe(true);
      expect(localStorageService.getPetById(pet.id)).toBeNull();
    });

    it('should paginate pets', () => {
      for (let i = 0; i < 15; i++) {
        localStorageService.addPet({
          nome: `Pet ${i}`,
          especie: 'Cachorro',
        });
      }

      const page1 = localStorageService.getPetsPaginated(0, 10);
      expect(page1.content.length).toBe(10);
      expect(page1.totalPages).toBe(2);
      expect(page1.totalElements).toBe(15);

      const page2 = localStorageService.getPetsPaginated(1, 10);
      expect(page2.content.length).toBe(5);
    });

    it('should filter pets by name', () => {
      localStorageService.addPet({ nome: 'Rex', especie: 'Cachorro' });
      localStorageService.addPet({ nome: 'Max', especie: 'Cachorro' });
      localStorageService.addPet({ nome: 'Bella', especie: 'Gato' });

      const result = localStorageService.getPetsPaginated(0, 10, 'Rex');
      
      expect(result.content.length).toBe(1);
      expect(result.content[0].nome).toBe('Rex');
    });
  });

  describe('Tutors', () => {
    it('should add and retrieve tutors', () => {
      const tutor = localStorageService.addTutor({
        nome: 'João Silva',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
      });

      expect(tutor.id).toBeDefined();
      expect(tutor.nome).toBe('João Silva');
      expect(tutor.petIds).toEqual([]);
      
      const retrieved = localStorageService.getTutorById(tutor.id);
      expect(retrieved).toEqual(tutor);
    });

    it('should update tutor', () => {
      const tutor = localStorageService.addTutor({
        nome: 'João Silva',
        telefone: '11999999999',
      });

      const updated = localStorageService.updateTutor(tutor.id, { nome: 'João Santos' });
      
      expect(updated?.nome).toBe('João Santos');
    });

    it('should delete tutor', () => {
      const tutor = localStorageService.addTutor({
        nome: 'João Silva',
        telefone: '11999999999',
      });

      const result = localStorageService.deleteTutor(tutor.id);
      
      expect(result).toBe(true);
      expect(localStorageService.getTutorById(tutor.id)).toBeNull();
    });
  });

  describe('Pet-Tutor Link', () => {
    it('should link pet to tutor', () => {
      const pet = localStorageService.addPet({ nome: 'Rex', especie: 'Cachorro' });
      const tutor = localStorageService.addTutor({ nome: 'João', telefone: '11999999999' });

      const result = localStorageService.linkPetToTutor(tutor.id, pet.id);
      
      expect(result).toBe(true);
      
      const updatedTutor = localStorageService.getTutorById(tutor.id);
      expect(updatedTutor?.petIds).toContain(pet.id);
      
      const updatedPet = localStorageService.getPetById(pet.id);
      expect(updatedPet?.tutorId).toBe(tutor.id);
    });

    it('should unlink pet from tutor', () => {
      const pet = localStorageService.addPet({ nome: 'Rex', especie: 'Cachorro' });
      const tutor = localStorageService.addTutor({ nome: 'João', telefone: '11999999999' });
      
      localStorageService.linkPetToTutor(tutor.id, pet.id);
      const result = localStorageService.unlinkPetFromTutor(tutor.id, pet.id);
      
      expect(result).toBe(true);
      
      const updatedTutor = localStorageService.getTutorById(tutor.id);
      expect(updatedTutor?.petIds).not.toContain(pet.id);
      
      const updatedPet = localStorageService.getPetById(pet.id);
      expect(updatedPet?.tutorId).toBeUndefined();
    });

    it('should get pets by tutor id', () => {
      const pet1 = localStorageService.addPet({ nome: 'Rex', especie: 'Cachorro' });
      const pet2 = localStorageService.addPet({ nome: 'Max', especie: 'Cachorro' });
      const tutor = localStorageService.addTutor({ nome: 'João', telefone: '11999999999' });
      
      localStorageService.linkPetToTutor(tutor.id, pet1.id);
      localStorageService.linkPetToTutor(tutor.id, pet2.id);
      
      const pets = localStorageService.getPetsByTutorId(tutor.id);
      
      expect(pets.length).toBe(2);
    });

    it('should get available pets (without tutor)', () => {
      const pet1 = localStorageService.addPet({ nome: 'Rex', especie: 'Cachorro' });
      const pet2 = localStorageService.addPet({ nome: 'Max', especie: 'Cachorro' });
      const tutor = localStorageService.addTutor({ nome: 'João', telefone: '11999999999' });
      
      localStorageService.linkPetToTutor(tutor.id, pet1.id);
      
      const availablePets = localStorageService.getAvailablePetsForTutor();
      
      expect(availablePets.length).toBe(1);
      expect(availablePets[0].id).toBe(pet2.id);
    });
  });

  describe('Stats', () => {
    it('should return correct stats', () => {
      localStorageService.addPet({ nome: 'Rex', especie: 'Cachorro' });
      localStorageService.addPet({ nome: 'Max', especie: 'Cachorro' });
      localStorageService.addTutor({ nome: 'João', telefone: '11999999999' });
      
      const stats = localStorageService.getStats();
      
      expect(stats.totalPets).toBe(2);
      expect(stats.totalTutors).toBe(1);
      expect(stats.linkedPets).toBe(0);
    });
  });
});
