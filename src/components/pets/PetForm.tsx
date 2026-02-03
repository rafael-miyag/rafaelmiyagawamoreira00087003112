import React, { useState } from 'react';
import { Button, Input } from '../ui';
import ImageUpload from '../ui/ImageUpload';
import { Pet, getPhotoUrl } from '@/types';

export interface PetFormData {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  foto?: File;
}

interface PetFormProps {
  initialData?: Partial<Pet>;
  onSubmit: (data: Omit<Pet, 'id'>, photo?: File) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PetForm: React.FC<PetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    especie: initialData?.especie || '',
    raca: initialData?.raca || '',
    idade: initialData?.idade?.toString() || '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.especie.trim()) {
      newErrors.especie = 'Espécie é obrigatória';
    }

    if (formData.idade && isNaN(parseInt(formData.idade, 10))) {
      newErrors.idade = 'Idade deve ser um número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(
        {
          nome: formData.nome,
          especie: formData.especie,
          raca: formData.raca || undefined,
          idade: formData.idade ? parseInt(formData.idade, 10) : undefined,
        },
        selectedPhoto || undefined
      );
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex justify-center">
        <ImageUpload
          value={getPhotoUrl(initialData as Pet)}
          onChange={setSelectedPhoto}
          size="lg"
        />
      </div>

      <Input
        label="Nome"
        value={formData.nome}
        onChange={(e) => handleChange('nome', e.target.value)}
        error={errors.nome}
        placeholder="Digite o nome do pet"
        required
      />

      <Input
        label="Espécie"
        value={formData.especie}
        onChange={(e) => handleChange('especie', e.target.value)}
        error={errors.especie}
        placeholder="Ex: Cachorro, Gato, Pássaro"
        required
      />

      <Input
        label="Raça"
        value={formData.raca}
        onChange={(e) => handleChange('raca', e.target.value)}
        placeholder="Ex: Labrador, Siamês"
      />

      <Input
        label="Idade (anos)"
        type="number"
        value={formData.idade}
        onChange={(e) => handleChange('idade', e.target.value)}
        error={errors.idade}
        placeholder="Digite a idade"
        min={0}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initialData?.nome ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default PetForm;
