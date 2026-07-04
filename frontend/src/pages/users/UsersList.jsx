import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from '../../api/userApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../components/common/useToast';

export default function UsersList() {
  const { data = [], isLoading, isError } = useGetUsersQuery();
  const [delUser] = useDeleteUserMutation();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [deleteId, setDeleteId] = useState(null);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await delUser(deleteId).unwrap();
      showToast('User deleted');
      setDeleteId(null);
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  const toggleStatus = async (user) => {
    const next = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateStatus({ id: user.id, status: next }).unwrap();
      showToast(`User ${next === 'active' ? 'activated' : 'deactivated'}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load users.</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Users</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage admin and staff accounts</p>
        </div>
        <Link
          to="/users/new"
          className="bg-accent-500 text-white px-4 py-2 rounded-md hover:bg-accent-600 transition-colors font-medium shadow-sm"
        >
          Create User
        </Link>
      </div>
      <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-800 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Email</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-neutral-500">No users found</td>
              </tr>
            ) : (
              data.map((u) => (
                <tr key={u.id} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4"><StatusBadge status={u.status} /></td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => toggleStatus(u)}
                        className="px-3 py-1.5 border rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link to={`/users/${u.id}`} className="px-3 py-1.5 border rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
