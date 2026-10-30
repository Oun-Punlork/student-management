import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUserApi,
  deleteUserApi,
  fetchUsersApi,
  updateUserRoleApi,
  updateUserStatusApi,
} from '../../service/userApi';

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];
const formatDate = (date) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date));

export default function Users() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersApi,
  });
  const needsSignIn =
    isError && error.message.startsWith('Your sign-in session');

  const createMutation = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      setForm({ username: '', email: '', password: '', role: 'STUDENT' });
      setMessage('User created successfully.');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (mutationError) => {
      setErrorMessage(mutationError.message);
      setMessage('');
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRoleApi(id, role),
    onSuccess: () => {
      setMessage('User role updated.');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (mutationError) => {
      setErrorMessage(mutationError.message);
      setMessage('');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateUserStatusApi(id, status),
    onSuccess: () => {
      setMessage('User status updated.');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (mutationError) => {
      setErrorMessage(mutationError.message);
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      setMessage('User and linked student profile deleted.');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (mutationError) => {
      setErrorMessage(mutationError.message);
      setMessage('');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');
    createMutation.mutate(form);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Users &amp; Roles</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create accounts and manage access roles.
        </p>
      </header>

      {(message || errorMessage || isError) && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            errorMessage || isError
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role={errorMessage || isError ? 'alert' : 'status'}
        >
          {errorMessage || (isError ? error.message : message)}
          {needsSignIn ? (
            <Link to="/login" className="ml-3 font-semibold underline">
              Sign in
            </Link>
          ) : isError ? (
            <button type="button" onClick={() => refetch()} className="ml-3 font-semibold underline">
              Try again
            </button>
          ) : null}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Create user</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold text-slate-600">
            Username
            <input
              required
              minLength={2}
              maxLength={100}
              autoComplete="off"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Email
            <input
              required
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Temporary password
            <input
              required
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Role
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">User accounts</h2>
            <p className="mt-0.5 text-xs text-slate-500">{users.length} users</p>
          </div>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500" role="status">Loading users…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Username</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="text-slate-700">
                    <td className="px-5 py-3 font-semibold text-slate-900">{user.username}</td>
                    <td className="px-5 py-3">{user.email}</td>
                    <td className="px-5 py-3">
                      <select
                        aria-label={`Role for ${user.username}`}
                        value={user.role}
                        disabled={roleMutation.isPending}
                        onChange={(event) => roleMutation.mutate({ id: user.id, role: event.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-indigo-400 disabled:opacity-50"
                      >
                        {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {user.createdAt ? formatDate(user.createdAt) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: user.id,
                              status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            })
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.status === 'ACTIVE'
                              ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Delete ${user.username}? This also deletes their linked student profile and its attendance and score records. This cannot be undone.`,
                            );
                            if (confirmed) deleteMutation.mutate(user.id);
                          }}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length && !isError && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
