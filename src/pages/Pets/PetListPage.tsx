import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '@/hooks/usePets';
import { Pet, getPhotoUrl } from '@/types';
import { Card, Button, Input, Loading, Modal, Pagination } from '@/components/ui';
import PetForm from '@/components/pets/PetForm';
import { Search, Plus, PawPrint } from 'lucide-react';

export default function PetListPage() {
  const navigate = useNavigate();
  const { pets, loading, error, pagination, loadPets, createPet, clearError } = usePets();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPets(0, 10);
  }, [loadPets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPets(0, 10, searchTerm.trim() || undefined);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadPets(0, 10);
  };

  const handleCreatePet = async (petData: Omit<Pet, 'id'>, photo?: File) => {
    setSubmitting(true);
    try {
      const newPet = await createPet(petData, photo);
      if (newPet) {
        setShowModal(false);
        loadPets(0, 10);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardClick = (petId: number | string) => {
    navigate(`/pets/${petId}`);
  };

  const handlePageChange = (page: number) => {
    loadPets(page, pagination.size, searchTerm.trim() || undefined);
  };

  if (loading && pets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-blue-600" />
            Pets
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os pets cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Pet
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
        {searchTerm && (
          <Button type="button" variant="outline" onClick={handleClearSearch}>
            Limpar
          </Button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {/* Pet List */}
      {pets.length === 0 ? (
        <div className="text-center py-12">
          <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum pet encontrado</h3>
          <p className="text-gray-500 mt-1">Comece cadastrando um novo pet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => {
            const photoUrl = getPhotoUrl(pet);
            return (
              <Card
                key={pet.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCardClick(pet.id)}
              >
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={pet.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${photoUrl ? 'hidden' : ''}`}>
                    <PawPrint className="w-16 h-16 text-gray-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{pet.nome}</h3>
                  <p className="text-gray-600">{pet.especie}</p>
                  {pet.idade !== undefined && (
                    <p className="text-sm text-gray-500">
                      {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Pet"
        size="lg"
      >
        <PetForm
          onSubmit={handleCreatePet}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>
    </div>
  );
}
