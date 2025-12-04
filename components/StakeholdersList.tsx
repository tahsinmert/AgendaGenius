import React, { useState } from 'react';
import { Stakeholder } from '../types';
import { Users, Plus, X, UserPlus } from 'lucide-react';

interface StakeholdersListProps {
  stakeholders: Stakeholder[];
  onAdd: (stakeholder: Stakeholder) => void;
  onRemove: (index: number) => void;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const getColor = (name: string) => {
    const colors = [
        'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const StakeholdersList: React.FC<StakeholdersListProps> = ({ stakeholders, onAdd, onRemove }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newRole.trim()) {
        onAdd({ name: newName, role: newRole });
        setNewName('');
        setNewRole('');
        setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center space-x-2 text-zinc-800 dark:text-zinc-200 font-semibold">
          <Users className="w-5 h-5 text-indigo-500" />
          <h3>Attendees & Roles</h3>
       </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stakeholders.map((person, idx) => (
          <div key={idx} className="group relative flex items-center space-x-3 p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${getColor(person.name)}`}>
              {getInitials(person.name)}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate" title={person.name}>{person.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate" title={person.role}>{person.role}</span>
            </div>
            <button 
                onClick={() => onRemove(idx)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-zinc-400 hover:text-red-500 transition-all"
            >
                <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Add New Stakeholder Button/Form */}
        {isAdding ? (
            <form onSubmit={handleAddSubmit} className="flex flex-col space-y-2 p-3 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-blue-300 dark:border-blue-800">
                <input 
                    autoFocus
                    placeholder="Name" 
                    className="text-sm bg-transparent border-b border-zinc-200 dark:border-zinc-700 outline-none pb-1"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input 
                    placeholder="Role" 
                    className="text-xs bg-transparent border-b border-zinc-200 dark:border-zinc-700 outline-none pb-1"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                />
                <div className="flex justify-end space-x-2 pt-1">
                    <button type="button" onClick={() => setIsAdding(false)} className="p-1 text-zinc-400 hover:text-zinc-600"><X className="w-3 h-3" /></button>
                    <button type="submit" disabled={!newName || !newRole} className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                </div>
            </form>
        ) : (
            <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-zinc-500 hover:text-blue-600 transition-all"
            >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Person</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default StakeholdersList;