import api from './api';

export interface AccountData {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  lastLogin: string | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  rating: number;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAccountData {
  email?: string;
  username?: string;
  password?: string;
  bio?: string;
  avatar?: File;
}

export interface AccountResponse {
  success: boolean;
  data: AccountData;
  message?: string;
  error?: string;
}

export interface UpdateAccountResponse {
  success: boolean;
  message: string;
  data: AccountData;
  error?: string;
}

class AccountService {
  /**
   * Get current user's account details
   */
  async getMyAccount(): Promise<AccountData> {
    const response = await api.get<AccountResponse>('/account/me');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch account details');
    }
    
    return response.data.data;
  }

  /**
   * Get account details by UUID (public information only)
   */
  async getAccountByUuid(uuid: string): Promise<Partial<AccountData>> {
    const response = await api.get<AccountResponse>(`/account/${uuid}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch account details');
    }
    
    return response.data.data;
  }

  /**
   * Update current user's account details
   * Supports both JSON and multipart/form-data for avatar uploads
   */
  async updateMyAccount(data: UpdateAccountData): Promise<AccountData> {
    // Always use FormData since backend expects multipart/form-data
    const formData = new FormData();
    
    if (data.email) formData.append('email', data.email);
    if (data.username) formData.append('username', data.username);
    if (data.password) formData.append('password', data.password);
    if (data.bio !== undefined) formData.append('bio', data.bio);
    if (data.avatar) formData.append('avatar', data.avatar);

    // Remove the default Content-Type header to let browser set it with boundary
    const response = await api.post<UpdateAccountResponse>('/account/me', formData, {
      headers: {
        'Content-Type': undefined
      }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update account');
    }
    
    return response.data.data;
  }

  /**
   * Get avatar URL for a user
   */
  getAvatarUrl(uuid: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return `${baseUrl}/files/avatar/${uuid}`;
  }

  /**
   * Resize image to 256x256 using canvas
   */
  async resizeImage(file: File, maxSize: number = 256): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to desired dimensions
        canvas.width = maxSize;
        canvas.height = maxSize;

        // Calculate dimensions to maintain aspect ratio
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let drawWidth = maxSize;
        let drawHeight = maxSize;
        let offsetX = 0;
        let offsetY = 0;

        if (aspectRatio > 1) {
          // Image is wider than it is tall
          drawWidth = maxSize;
          drawHeight = maxSize / aspectRatio;
          offsetY = (maxSize - drawHeight) / 2;
        } else {
          // Image is taller than it is wide
          drawHeight = maxSize;
          drawWidth = maxSize * aspectRatio;
          offsetX = (maxSize - drawWidth) / 2;
        }

        // Fill background with transparent or white
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, maxSize, maxSize);
          
          // Draw the resized image
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          }, file.type, 0.9); // 90% quality
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

export default new AccountService(); 