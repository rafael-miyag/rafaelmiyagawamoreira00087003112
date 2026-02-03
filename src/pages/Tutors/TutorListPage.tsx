import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User } from 'lucide-react';
import { useTutors } from '../../hooks/useTutors';
import { Card, Button, Input, Loading, Modal, Pagination } from '../../components/ui';
import TutorForm from '../../components/tutors/TutorForm';
import { Tutor, getPhotoUrl } from '../../types';

export const TutorListPage: React.FC = () => {
  const navigate = useNavigate();
  const { tutors, loading, error, totalPages, currentPage, loadTutors, createTutor, clearError } = useTutors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTutors(0, 10);
  }, [loadTutors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTutors(0, 10, searchTerm || undefined);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadTutors(0, 10);
  };

  const handlePageChange = (page: number) => {
    loadTutors(page, 10, searchTerm || undefined);
  };

  const handleCreateTutor = async (data: Omit<Tutor, 'id'>, photo?: File) => {
    setIsSubmitting(true);
    try {
      const result = await createTutor(data, photo);
      
      if (result) {
        setIsModalOpen(false);
        loadTutors(currentPage, 10, searchTerm || undefined);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (id: number | string) => {
    navigate(`/tutores/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-8 h-8 text-blue-600" />
            Tutores
          </h1>
          <p className="text-gray-600">Gerencie os tutores cadastrados</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Tutor
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          <Search className="w-5 h-5" />
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

      {/* Content */}
      {loading ? (
        <Loading size="lg" text="Carregando tutores..." />
      ) : tutors.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Nenhum tutor encontrado</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm ? 'Tente uma busca diferente' : 'Clique em "Novo Tutor" para cadastrar'}
          </p>
        </div>
      ) : (
        <>
          {/* Tutor Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutors.map((tutor) => {
              const tutorPhoto = getPhotoUrl(tutor);
              const petsCount = tutor.pets?.length || 0;
              
              return (
                <Card
                  key={tutor.id}
                  onClick={() => handleCardClick(tutor.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      {tutorPhoto ? (
                        <img
                          src={tutorPhoto}
                          alt={tutor.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${tutorPhoto ? 'hidden' : ''}`}>
                        <User className="w-8 h-8 text-gray-300" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{tutor.nome}</h3>
                      {tutor.telefone && (
                        <p className="text-sm text-gray-600 truncate">{tutor.telefone}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {petsCount} pet(s) vinculado(s)
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Tutor"
      >
        <TutorForm
          onSubmit={handleCreateTutor}
          onCancel={() => setIsModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default TutorListPage;
