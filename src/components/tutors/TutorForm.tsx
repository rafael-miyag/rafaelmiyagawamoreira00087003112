import React, { useState } from 'react';
import { Button, Input } from '../ui';
import ImageUpload from '../ui/ImageUpload';
import { Tutor, getPhotoUrl } from '@/types';

export interface TutorFormData {
  nome: string;
  telefone?: string;
  endereco?: string;
  foto?: File;
}

interface TutorFormProps {
  initialData?: Partial<Tutor>;
  onSubmit: (data: Omit<Tutor, 'id'>, photo?: File) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Máscara para telefone
const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
};

export const TutorForm: React.FC<TutorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    telefone: initialData?.telefone || '',
    endereco: initialData?.endereco || '',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
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
          telefone: formData.telefone || undefined,
          endereco: formData.endereco || undefined,
        },
        selectedPhoto || undefined
      );
    }
  };

  const handleChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'telefone') {
      processedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex justify-center">
        <ImageUpload
          value={getPhotoUrl(initialData as Tutor)}
          onChange={setSelectedPhoto}
          size="lg"
        />
      </div>

      <Input
        label="Nome Completo"
        value={formData.nome}
        onChange={(e) => handleChange('nome', e.target.value)}
        error={errors.nome}
        placeholder="Digite o nome completo"
        required
      />

      <Input
        label="Telefone"
        value={formData.telefone}
        onChange={(e) => handleChange('telefone', e.target.value)}
        placeholder="(00) 00000-0000"
        maxLength={15}
      />

      <Input
        label="Endereço"
        value={formData.endereco}
        onChange={(e) => handleChange('endereco', e.target.value)}
        placeholder="Digite o endereço"
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

export default TutorForm;
