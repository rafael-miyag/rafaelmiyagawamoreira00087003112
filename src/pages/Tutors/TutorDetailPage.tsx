import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, Phone, MapPin, PawPrint, Plus, X, Loader2 } from 'lucide-react';
import { useTutor } from '../../hooks/useTutors';
import { Button, Card, Loading, Modal, ConfirmDialog } from '../../components/ui';
import TutorForm from '../../components/tutors/TutorForm';
import { Pet, Tutor, getPhotoUrl } from '../../types';

const TutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tutorId = id;
  
  const { 
    tutor, 
    tutorPets, 
    availablePets,
    loading, 
    error,
    loadTutor, 
    updateTutor, 
    deleteTutor,
    linkPet,
    unlinkPet,
    loadAvailablePets,
  } = useTutor(tutorId);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLinkPetModalOpen, setIsLinkPetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [petToUnlink, setPetToUnlink] = useState<Pet | null>(null);
  const [loadingPets, setLoadingPets] = useState(false);

  // Carregar pets disponíveis quando abrir o modal
  const handleOpenLinkModal = useCallback(async () => {
    setIsLinkPetModalOpen(true);
    setLoadingPets(true);
    try {
      await loadAvailablePets();
    } finally {
      setLoadingPets(false);
    }
  }, [loadAvailablePets]);

  // Recarregar lista quando modal é aberto
  useEffect(() => {
    if (isLinkPetModalOpen) {
      loadAvailablePets();
    }
  }, [isLinkPetModalOpen, loadAvailablePets]);

  const handleUpdate = async (data: Omit<Tutor, 'id'>, photo?: File) => {
    if (!tutorId) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateTutor(tutorId, data, photo);
      
      if (result) {
        setIsEditModalOpen(false);
        loadTutor(tutorId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tutorId) return;
    
    const success = await deleteTutor(tutorId);
    if (success) {
      navigate('/tutores');
    }
  };

  const handleLinkPet = async (petId: number | string) => {
    if (!tutorId) return;
    
    setIsSubmitting(true);
    try {
      const success = await linkPet(tutorId, petId);
      if (success) {
        setIsLinkPetModalOpen(false);
        // Recarrega o tutor para atualizar a lista de pets
        await loadTutor(tutorId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkPet = async () => {
    if (!tutorId || !petToUnlink) return;
    
    setIsSubmitting(true);
    try {
      const success = await unlinkPet(tutorId, petToUnlink.id);
      if (success) {
        setPetToUnlink(null);
        // Recarrega o tutor para atualizar a lista
        await loadTutor(tutorId);
      }
    } finally {
      setIsSubmitting(false);
      setPetToUnlink(null);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Carregando tutor..." />;
  }

  if (!tutor) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">Tutor não encontrado</h3>
        <Link to="/tutores" className="text-blue-600 hover:underline mt-2 inline-block">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const tutorPhoto = getPhotoUrl(tutor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/tutores"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Detalhes do Tutor</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor Info */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0">
              {tutorPhoto ? (
                <img
                  src={tutorPhoto}
                  alt={tutor.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">{tutor.nome}</h2>
              
              <div className="space-y-3">
                {tutor.telefone && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{tutor.telefone}</span>
                  </div>
                )}
                
                {tutor.endereco && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{tutor.endereco}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-center md:justify-start gap-3 mt-6">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="danger"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas</h3>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-blue-600">{tutorPets.length}</p>
            <p className="text-gray-600">Pet(s) vinculado(s)</p>
          </div>
        </Card>
      </div>

      {/* Pets Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <PawPrint className="w-5 h-5" />
            Pets Vinculados
          </h3>
          <Button
            onClick={handleOpenLinkModal}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Vincular Pet
          </Button>
        </div>

        {tutorPets.length === 0 ? (
          <div className="text-center py-8">
            <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum pet vinculado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorPets.map((pet) => {
              const petPhoto = getPhotoUrl(pet);
              
              return (
                <div
                  key={pet.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {petPhoto ? (
                      <img
                        src={petPhoto}
                        alt={pet.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PawPrint className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/pets/${pet.id}`}
                      className="font-medium text-gray-800 hover:text-blue-600 truncate block"
                    >
                      {pet.nome}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{pet.especie}</p>
                  </div>
                  <button
                    onClick={() => setPetToUnlink(pet)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Desvincular pet"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Tutor"
      >
        <TutorForm
          initialData={tutor}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>

      {/* Link Pet Modal */}
      <Modal
        isOpen={isLinkPetModalOpen}
        onClose={() => setIsLinkPetModalOpen(false)}
        title="Vincular Pet"
      >
        {loadingPets ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Carregando pets disponíveis...</p>
          </div>
        ) : availablePets.length === 0 ? (
          <div className="text-center py-8">
            <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum pet disponível para vincular</p>
            <p className="text-gray-400 text-sm mt-1">Todos os pets já estão vinculados a tutores</p>
            <Link
              to="/pets"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Cadastrar novo pet
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availablePets.map((pet) => {
              const petPhoto = getPhotoUrl(pet);
              
              return (
                <button
                  key={pet.id}
                  onClick={() => handleLinkPet(pet.id)}
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {petPhoto ? (
                      <img
                        src={petPhoto}
                        alt={pet.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PawPrint className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{pet.nome}</p>
                    <p className="text-sm text-gray-500">{pet.especie}</p>
                  </div>
                  <Plus className="w-5 h-5 text-blue-600" />
                </button>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Tutor"
        message={`Tem certeza que deseja excluir ${tutor.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Unlink Pet Confirmation */}
      <ConfirmDialog
        isOpen={!!petToUnlink}
        onClose={() => setPetToUnlink(null)}
        onConfirm={handleUnlinkPet}
        title="Desvincular Pet"
        message={`Tem certeza que deseja desvincular ${petToUnlink?.nome} deste tutor?`}
        confirmText="Desvincular"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};

export default TutorDetailPage;
