import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, PawPrint, User, Phone, MapPin, Loader2, LinkIcon } from 'lucide-react';
import { usePet } from '../../hooks/usePets';
import { Button, Card, Loading, Modal, ConfirmDialog } from '../../components/ui';
import PetForm from '../../components/pets/PetForm';
import { Pet, getPhotoUrl } from '../../types';

const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const petId = id;
  
  const { pet, tutor, loading, loadPet, updatePet, deletePet, findTutorForPet } = usePet(petId);
  
  const [searchingTutor, setSearchingTutor] = useState(false);
  const [foundTutor, setFoundTutor] = useState(tutor);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualiza o tutor local quando o tutor do hook mudar
  useEffect(() => {
    setFoundTutor(tutor);
  }, [tutor]);

  // Busca tutor na lista de tutores se não encontrou pelo pet
  useEffect(() => {
    const searchTutor = async () => {
      if (pet && !tutor && !searchingTutor && petId) {
        setSearchingTutor(true);
        try {
          const tutorFound = await findTutorForPet(petId);
          if (tutorFound) {
            setFoundTutor(tutorFound);
          }
        } finally {
          setSearchingTutor(false);
        }
      }
    };
    
    searchTutor();
  }, [pet, tutor, petId, findTutorForPet, searchingTutor]);

  const handleUpdate = async (data: Omit<Pet, 'id'>, photo?: File) => {
    if (!petId) return;
    
    setIsSubmitting(true);
    try {
      const result = await updatePet(petId, data, photo);
      
      if (result) {
        setIsEditModalOpen(false);
        loadPet(petId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!petId) return;
    
    const success = await deletePet(petId);
    if (success) {
      navigate('/pets');
    }
  };

  if (loading) {
    return <Loading size="lg" text="Carregando pet..." />;
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">Pet não encontrado</h3>
        <Link to="/pets" className="text-blue-600 hover:underline mt-2 inline-block">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const petPhoto = getPhotoUrl(pet);
  const currentTutor = foundTutor || tutor;
  const tutorPhoto = currentTutor ? getPhotoUrl(currentTutor) : null;
  const isLoadingTutor = searchingTutor;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/pets"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Detalhes do Pet</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet Info */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {petPhoto ? (
                <img
                  src={petPhoto}
                  alt={pet.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PawPrint className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">{pet.nome}</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">Espécie</span>
                  <p className="text-gray-800 font-medium">{pet.especie}</p>
                </div>
                
                {pet.raca && (
                  <div>
                    <span className="text-gray-500 text-sm">Raça</span>
                    <p className="text-gray-800 font-medium">{pet.raca}</p>
                  </div>
                )}
                
                {pet.idade !== undefined && (
                  <div>
                    <span className="text-gray-500 text-sm">Idade</span>
                    <p className="text-gray-800 font-medium">
                      {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
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

        {/* Tutor Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Tutor Vinculado
          </h3>
          
          {isLoadingTutor ? (
            <div className="text-center py-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Buscando tutor...</p>
            </div>
          ) : currentTutor ? (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-gray-100">
                {tutorPhoto ? (
                  <img
                    src={tutorPhoto}
                    alt={currentTutor.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="font-medium text-gray-800">{currentTutor.nome}</p>
              </div>
              
              {currentTutor.telefone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{currentTutor.telefone}</span>
                </div>
              )}
              
              {currentTutor.endereco && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{currentTutor.endereco}</span>
                </div>
              )}
              
              <Link
                to={`/tutores/${currentTutor.id}`}
                className="block text-center text-blue-600 hover:underline text-sm"
              >
                Ver detalhes do tutor
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Sem tutor vinculado</p>
              <p className="text-gray-400 text-xs mt-2">
                Vincule este pet a um tutor na página de tutores
              </p>
              <Link
                to="/tutores"
                className="inline-block mt-3 text-blue-600 hover:underline text-sm"
              >
                Ir para Tutores
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Pet"
      >
        <PetForm
          initialData={pet}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Pet"
        message={`Tem certeza que deseja excluir ${pet.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default PetDetailPage;
