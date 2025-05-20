'use client';

import { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import { toast } from 'react-toastify';

interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: AdminUser[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário admin?')) {
      try {
        // TODO: Adicionar lógica para prevenir a exclusão do próprio usuário logado
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        // Remover o usuário da lista no estado
        setUsers(users.filter(user => user.id !== userId));
        // TODO: Exibir mensagem de sucesso (toast)

      } catch (err: any) {
        console.error('Error deleting user:', err);
        // TODO: Exibir mensagem de erro (toast)
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleSaveUser = async () => {
    setFormErrors({}); // Clear previous errors
    const errors: {[key: string]: string} = {};

    // Validate email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validate password for new user or if password is being changed
    if (!editingUser || formData.password !== '') {
      if (!formData.password) {
        errors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        errors.password = 'A senha deve ter pelo menos 6 caracteres';
      }

      // Validate password confirmation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    setError(null); // Clear any previous API errors

    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          // Incluir a senha apenas se for um novo usuário ou a senha estiver sendo alterada
          ...(formData.password !== '' && { password: formData.password }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar usuário');
      }

      // Atualizar a lista de usuários
      fetchUsers();
      toast.success(editingUser ? 'Usuário admin atualizado com sucesso!' : 'Usuário admin criado com sucesso!');
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário');
      toast.error(`Erro ao salvar usuário: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Erro"
        message={error}
      />
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Usuários Admin</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os usuários com acesso ao painel administrativo.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => {
              setEditingUser(null);
              setFormData({ email: '', password: '', confirmPassword: '', });
              setFormErrors({});
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <Table
          headers={[
            { key: 'id', label: 'ID' },
            { key: 'email', label: 'Email' },
            { key: 'createdAt', label: 'Data de Criação' },
            { key: 'actions', label: 'Ações' },
          ]}
          data={users.map(user => ({
            ...user,
            createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR'),
            actions: (
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(user)}
                >
                  <PencilIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(user.id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </Button>
              </div>
            ),
          }))}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuário Admin' : 'Novo Usuário Admin'}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            disabled={!!editingUser}
          />
          <Input
            label={editingUser ? 'Nova Senha (opcional)' : 'Senha'}
            name="password"
            type="password"
            required={!editingUser}
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.password}
          />
          <Input
            label={editingUser ? 'Confirmar Nova Senha' : 'Confirmar Senha'}
            name="confirmPassword"
            type="password"
            required={!editingUser || formData.password !== ''}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={formErrors.confirmPassword}
          />

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 