// File: frontend/src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Request, StatusFilter, PriorityFilter } from './types/requestTypes';
import { fetchRequests, createRequest, updateRequestStatus, deleteRequest } from './api/requestsApi';

// --- Component Placeholders (Will be implemented later) ---
const FormCreate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    return (
        <section className="card p-4 mb-6 bg-white border rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4">➕ Создание новой заявки</h2>
            {/* Реализация формы создания заявки */}
            <p>Form component placeholder: Needs Title (3-120), Description (max 1000), Status, Priority inputs.</p>
            <button onClick={() => { alert("TODO: Submit Create Request API call"); onSuccess(); }} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Создать заявку</button>
        </section>
    );
};

const RequestTable: React.FC<{ 
    requests: Request[]; 
    onStatusChange: (requestId: number, newStatus: StatusFilter) => void;
    onDeleteClick: (requestId: number) => Promise<void>;
}> = ({ requests, onStatusChange, onDeleteClick }) => {
    // Логика рендеринга таблицы/списка заявок
    return (
        <div className="overflow-x-auto bg-white p-4 rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">Список заявок пуст.</td></tr>
                    ) : (
                        requests.map((req) => (
                            <tr key={req.id} className={`${req.status === 'done' ? 'bg-red-50/50 line-through' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{req.title}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(req.status)}`}>{req.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{req.priority}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button onClick={() => onStatusChange(req.id, 'in_progress')} className="text-indigo-600 hover:underline mr-1">[!]</button> {/* Status Change */}
                                    {/* Admin deletion button placeholder */}
                                    {/* <button onClick={() => onDeleteClick(req.id)} className="text-red-600 hover:underline">Delete (Admin)</button> */} 
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Utility to determine status color for badges/display
const getStatusColor = (status: StatusFilter) => {
    switch (status) {
        case 'new': return 'text-blue-600 bg-blue-100';
        case 'in_progress': return 'text-yellow-700 bg-yellow-100';
        case 'done': return 'text-green-700 bg-green-100 line-through';
    }
};


// --- Main Component ---

const App: React.FC = () => {
    // State Management
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ status: '', priority: '', search: '', sortBy: 'created_at', sortDesc: true });
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });

    // Загрузка данных при старте компонента
    const loadRequests = useCallback(async (page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchRequests({
                ...filters, 
                page, 
                limit: pagination.limit
            });
            setRequests(result.data);
        } catch (err) {
            console.error("Failed to fetch requests:", err);
            setError("Не удалось загрузить заявки. Проверьте подключение к API.");
        } finally {
            setLoading(false);
        }
    }, [filters, pagination]);

    useEffect(() => {
        // Загружаем данные при изменении фильтров или пагинации
        loadRequests(); 
    }, [loading, loadRequests]);


    // --- Handlers: Actions that modify state/API ---

    const handleStatusChange = async (requestId: number, newStatus: StatusFilter) => {
        if (!window.confirm(`Вы уверены, что хотите изменить статус на "${newStatus}"?`)) return;
        try {
            await updateRequestStatus(requestId, { status: newStatus });
            alert("Статус успешно обновлен.");
            // После успешного обновления, перезагружаем список для актуализации данных
            loadRequests(); 
        } catch (e) {
            setError("Ошибка изменения статуса. Возможно, заявка находится в 'done' и редактирование запрещено.");
        }
    };

    const handleDeleteRequest = async (requestId: number) => {
         if (!window.confirm('ВНИМАНИЕ! Вы уверены, что хотите удалить эту заявку? Эта операция необратима.')) return;
        try {
            await deleteRequest(requestId);
            alert("Заявка успешно удалена.");
            loadRequests(); // Обновляем список после удаления
        } catch (e) {
            setError("Ошибка удаления. Возможно, у вас нет прав администратора или заявка находится в 'done'.");
        }
    };

    const handleCreateSuccess = () => {
        // После успешного создания, очищаем форму и перезагружаем список
        loadRequests(); 
    }


    // --- Render Logic ---
    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <header className="mb-8 pb-4 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Учет внутренних заявок</h1>
                <div>
                    {/* Административный вход placeholder */}
                    <button onClick={() => { 
                        localStorage.setItem('adminToken', 'correct_password'); 
                        alert("Админская сессия активирована!"); 
                    }} className="mr-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        [Admin Login]
                    </button>
                </div>
            </header>

            {/* Фильтры, Поиск и Сортировка (Control Bar) */}
            <div className="flex flex-wrap gap-4 p-4 mb-6 bg-white rounded shadow">
                <input 
                    type="text" 
                    placeholder="Поиск по Title или Description..."
                    onChange={(e) => setFilters({...filters, search: e.target.value})} 
                    className="p-2 border rounded flex-grow min-w-[150px]"
                />
                <select onChange={(e) => setFilters({...filters, status: e.target.value})} value={filters.status} className="p-2 border rounded">
                    <option value="">Фильтр по Статусу</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
                 <select onChange={(e) => setFilters({...filters, priority: e.target.value})} value={filters.priority} className="p-2 border rounded">
                    <option value="">Фильтр по Приоритету</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                </select>
                 {/* Сортировка (Simplified for placeholder) */}
                <div className='text-sm text-gray-600'>Сорт: {filters.sortBy} ({filters.sortDesc ? 'DESC' : 'ASC'})</div>
            </div>


            {/* Контентная область */}
            <main>
                <FormCreate onSuccess={handleCreateSuccess} />

                {loading && (
                    <div className="text-center text-lg p-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">Загрузка заявок...</div>
                )}
                {error && !loading && (
                    <div className="text-center text-lg p-8 bg-red-100 border-l-4 border-red-500 text-red-700 mb-6">{error}</div>
                )}

                {!loading && !error && <RequestTable 
                    requests={requests}
                    onStatusChange={handleStatusChange}
                    onDeleteClick={handleDeleteRequest}
                /> }

            </main>

            {/* Пагинация */}
             <div className="flex justify-between items-center mt-6 p-4 bg-white rounded shadow">
                <div>
                     {/* Здесь должна быть логика пагинатора (Current Page / Total Pages) */}
                    <span className='text-sm text-gray-600'>Страница 1 из N. Всего записей: {Object.keys(requests).length}</span>
                </div>
                 {/* Кнопки Next/Prev */}
             </div>

        </div>
    );
};

export default App;