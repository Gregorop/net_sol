import React, { useState } from 'react';
import { RequestStatus, RequestPriority, RequestFilters } from '../types';

interface RequestFiltersProps {
  filters: RequestFilters;
  onFilterChange: (filters: Partial<RequestFilters>) => void;
}

export const RequestFiltersComponent: React.FC<RequestFiltersProps> = ({ filters, onFilterChange }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [priority, setPriority] = useState(filters.priority || '');
  const [sort, setSort] = useState(filters.sort || '-created_at,+priority');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search, status: status as RequestStatus || undefined, priority: priority as RequestPriority || undefined, sort });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatus(value);
    onFilterChange({ search, status: value as RequestStatus || undefined, priority: priority as RequestPriority || undefined, sort });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPriority(value);
    onFilterChange({ search, status: status as RequestStatus || undefined, priority: value as RequestPriority || undefined, sort });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSort(value);
    onFilterChange({ search, status: status as RequestStatus || undefined, priority: priority as RequestPriority || undefined, sort: value });
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setSort('-created_at,+priority');
    onFilterChange({ search: '', status: undefined, priority: undefined, sort: '-created_at,+priority' });
  };

  return (
    <div>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Поиск по загаловку или описанию:"
          value={search}
          onChange={handleSearch}
        />
        <button type="submit">Искать:</button>
      </form>

      <div>
        <select value={status} onChange={handleStatusChange}>
          <option value="">Все подряд</option>
          <option value={RequestStatus.NEW}>New</option>
          <option value={RequestStatus.IN_PROGRESS}>In Progress</option>
          <option value={RequestStatus.DONE}>Done</option>
        </select>

        <select value={priority} onChange={handlePriorityChange}>
          <option value="">Все подряд</option>
          <option value={RequestPriority.LOW}>Low</option>
          <option value={RequestPriority.MEDIUM}>Medium</option>
          <option value={RequestPriority.HIGH}>High</option>
        </select>

        <select value={sort} onChange={handleSortChange}>
          <option value="-created_at,+priority">Новые приоритетные</option>
          <option value="+created_at,-priority">Старые не приоритетные</option>
          <option value="-priority,+created_at">Приоритетные старые</option>
          <option value="+priority,-created_at">Неприоритетные новые</option>
        </select>

        <button onClick={handleReset}>Сбросить фильтры</button>
      </div>
    </div>
  );
};