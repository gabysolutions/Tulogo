import { useState, useCallback, useEffect } from "react";
import {
  getUsersService,
  createUserService,
  updateUserService,
  deleteUserService,
  toggleUserStatusService,
} from "../services/user.service";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserTypeBreakdown,
} from "../types/user";

interface UseUsersResult {
  users: User[];
  total: number;
  totalByUserType: UserTypeBreakdown | null;
  loading: boolean;
  submitting: boolean;
  error: Error | null;
  refetch: () => void;
  createUser: (payload: CreateUserPayload) => Promise<boolean>;
  updateUser: (id: number, payload: UpdateUserPayload) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  toggleStatus: (id: number, currentStatus: number) => Promise<boolean>;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalByUserType, setTotalByUserType] = useState<UserTypeBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersService();
      setUsers(response.users);
      setTotal(response.total);
      setTotalByUserType(response.totalByUserType);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al obtener los usuarios"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(
    async (payload: CreateUserPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        await createUserService(payload);
        await fetchUsers();
        return true;
      } catch {
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchUsers]
  );

  const updateUser = useCallback(
    async (id: number, payload: UpdateUserPayload): Promise<boolean> => {
      setSubmitting(true);
      try {
        await updateUserService(id, payload);
        await fetchUsers();
        return true;
      } catch {
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (id: number): Promise<boolean> => {
      setSubmitting(true);
      try {
        await deleteUserService(id);
        await fetchUsers();
        return true;
      } catch {
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchUsers]
  );

 const toggleStatus = useCallback(
  async (id: number, currentStatus: number): Promise<boolean> => {
    const nextStatus: 0 | 1 = currentStatus === 1 ? 0 : 1;
    setSubmitting(true);
    try {
      await toggleUserStatusService(id, nextStatus);
      await fetchUsers();
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  },
  [fetchUsers]
);

  return {
    users,
    total,
    totalByUserType,
    loading,
    submitting,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
  };
}