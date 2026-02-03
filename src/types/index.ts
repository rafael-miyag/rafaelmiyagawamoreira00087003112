// Interface para foto com múltiplos formatos possíveis
export interface Photo {
  id?: number | string;
  url?: string;
  urlFoto?: string;
  fotoUrl?: string;
  foto?: string;
  path?: string;
  src?: string;
  link?: string;
  href?: string;
  imageUrl?: string;
  imagemUrl?: string;
  thumbnail?: string;
  base64?: string;
  data?: string;
}

export interface Pet {
  id: number | string;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  // Suporte a múltiplos formatos de foto
  foto?: string | Photo;
  urlFoto?: string;
  fotoUrl?: string;
  imagemUrl?: string;
  imageUrl?: string;
  image?: string;
  imagem?: string;
  thumbnail?: string;
  avatar?: string;
  picture?: string;
  pictureUrl?: string;
  photoUrl?: string;
  fotos?: (string | Photo)[];
  photos?: (string | Photo)[];
  imagens?: (string | Photo)[];
  images?: (string | Photo)[];
  // Diferentes formatos de referência ao tutor
  tutorId?: number | string;
  tutor_id?: number | string;
  idTutor?: number | string;
  tutor?: Tutor | null;
  // O tutor pode vir como objeto aninhado ou referência
  responsavel?: Tutor | null;
  dono?: Tutor | null;
  owner?: Tutor | null;
}

/**
 * Obtém o ID do tutor de um Pet, verificando diferentes campos possíveis
 */
export function getTutorId(pet: Pet | null | undefined): number | string | null {
  if (!pet) return null;
  
  // Verifica diferentes campos de ID do tutor
  if (pet.tutorId) return pet.tutorId;
  if (pet.tutor_id) return pet.tutor_id;
  if (pet.idTutor) return pet.idTutor;
  
  // Verifica se o tutor está embutido
  if (pet.tutor?.id) return pet.tutor.id;
  if (pet.responsavel?.id) return pet.responsavel.id;
  if (pet.dono?.id) return pet.dono.id;
  if (pet.owner?.id) return pet.owner.id;
  
  return null;
}

/**
 * Obtém o objeto Tutor de um Pet, verificando diferentes campos possíveis
 */
export function getTutorFromPet(pet: Pet | null | undefined): Tutor | null {
  if (!pet) return null;
  
  if (pet.tutor) return pet.tutor;
  if (pet.responsavel) return pet.responsavel;
  if (pet.dono) return pet.dono;
  if (pet.owner) return pet.owner;
  
  return null;
}

export interface Tutor {
  id: number | string;
  nome: string;
  telefone?: string;
  endereco?: string;
  // Suporte a múltiplos formatos de foto
  foto?: string | Photo;
  urlFoto?: string;
  fotoUrl?: string;
  imagemUrl?: string;
  imageUrl?: string;
  image?: string;
  imagem?: string;
  thumbnail?: string;
  avatar?: string;
  picture?: string;
  pictureUrl?: string;
  photoUrl?: string;
  fotos?: (string | Photo)[];
  photos?: (string | Photo)[];
  imagens?: (string | Photo)[];
  images?: (string | Photo)[];
  pets?: Pet[];
}

/**
 * Extrai a URL de uma foto de um objeto Photo
 */
function extractPhotoUrlFromObject(photo: Photo): string | null {
  // Tenta todos os campos possíveis
  const fields: (keyof Photo)[] = [
    'url', 'urlFoto', 'fotoUrl', 'foto', 'path', 'src', 'link', 'href',
    'imageUrl', 'imagemUrl', 'thumbnail', 'base64', 'data'
  ];
  
  for (const field of fields) {
    const value = photo[field];
    if (value && typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }
  
  return null;
}

/**
 * Extrai a URL de foto de uma string ou objeto Photo
 */
function extractPhotoUrl(photo: string | Photo | undefined | null): string | null {
  if (!photo) return null;
  
  // Se for string, retorna diretamente
  if (typeof photo === 'string') {
    return photo.trim() !== '' ? photo : null;
  }
  
  // Se for objeto, tenta extrair a URL
  if (typeof photo === 'object') {
    return extractPhotoUrlFromObject(photo);
  }
  
  return null;
}

/**
 * Extrai a primeira URL de foto válida de um array de fotos
 */
function extractFirstPhotoFromArray(photos: (string | Photo)[] | undefined | null): string | null {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return null;
  
  for (const photo of photos) {
    const url = extractPhotoUrl(photo);
    if (url) return url;
  }
  
  return null;
}

/**
 * Helper function to get photo URL from various formats
 * Suporta múltiplos formatos de resposta da API
 */
export function getPhotoUrl(entity: Pet | Tutor | null | undefined): string | null {
  if (!entity) return null;
  
  // Cast para any para acessar campos dinamicamente
  const obj = entity as unknown as Record<string, unknown>;
  
  // Campos de URL direta (ordem de prioridade)
  const directFields = [
    'urlFoto', 'fotoUrl', 'photoUrl', 'pictureUrl', 'imageUrl', 'imagemUrl',
    'foto', 'image', 'imagem', 'picture', 'avatar', 'thumbnail'
  ];
  
  // Tenta campos de URL direta
  for (const field of directFields) {
    const value = obj[field];
    
    if (value) {
      // Se for string
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
      // Se for objeto Photo
      if (typeof value === 'object' && value !== null) {
        const url = extractPhotoUrlFromObject(value as Photo);
        if (url) return url;
      }
    }
  }
  
  // Campos de array de fotos (ordem de prioridade)
  const arrayFields = ['fotos', 'photos', 'imagens', 'images'];
  
  for (const field of arrayFields) {
    const value = obj[field];
    if (value && Array.isArray(value)) {
      const url = extractFirstPhotoFromArray(value as (string | Photo)[]);
      if (url) return url;
    }
  }
  
  return null;
}

/**
 * Obtém todas as URLs de fotos de uma entidade
 */
export function getAllPhotoUrls(entity: Pet | Tutor | null | undefined): string[] {
  if (!entity) return [];
  
  const urls: string[] = [];
  
  // Cast para any para acessar campos dinamicamente
  const obj = entity as unknown as Record<string, unknown>;
  
  // Campos de URL direta
  const directFields = [
    'urlFoto', 'fotoUrl', 'photoUrl', 'pictureUrl', 'imageUrl', 'imagemUrl',
    'foto', 'image', 'imagem', 'picture', 'avatar', 'thumbnail'
  ];
  
  for (const field of directFields) {
    const value = obj[field];
    
    if (value) {
      if (typeof value === 'string' && value.trim() !== '') {
        if (!urls.includes(value)) urls.push(value);
      } else if (typeof value === 'object' && value !== null) {
        const url = extractPhotoUrlFromObject(value as Photo);
        if (url && !urls.includes(url)) urls.push(url);
      }
    }
  }
  
  // Campos de array
  const arrayFields = ['fotos', 'photos', 'imagens', 'images'];
  
  for (const field of arrayFields) {
    const value = obj[field];
    if (value && Array.isArray(value)) {
      for (const item of value) {
        const url = extractPhotoUrl(item as string | Photo);
        if (url && !urls.includes(url)) urls.push(url);
      }
    }
  }
  
  return urls;
}

export interface User {
  username: string;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  checks?: {
    name: string;
    status: string;
  }[];
}

export interface PetFormData {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  foto?: File;
}

export interface TutorFormData {
  nome: string;
  telefone?: string;
  endereco?: string;
  foto?: File;
}

export interface PetPage {
  content: Pet[];
  page?: number;
  number?: number;
  size?: number;
  totalPages: number;
  totalElements: number;
}

export interface TutorPage {
  content: Tutor[];
  page?: number;
  number?: number;
  size?: number;
  totalPages: number;
  totalElements: number;
}
