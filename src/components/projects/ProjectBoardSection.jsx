import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, MoreHorizontal, Calendar, 
  ArrowUp, Minus, CheckCircle2, ChevronDown, Plus, Loader2 
} from 'lucide-react';

// --- Sub-components ---
const PriorityBadge = ({ level }) => {
  if (level === 'High') {
    return (
      <div className="flex items-center text-red-500 text-xs font-medium gap-1">
        <ArrowUp className="w-3 h-3" /> {level}
      </div>
    );
  }
  return (
    <div className="flex items-center text-orange-400 text-xs font-medium gap-1">
      <Minus className="w-3 h-3" /> {level}
    </div>
  );
};

const TaskCard = ({ task, onDragStart }) => (
  <div 
    draggable
    onDragStart={onDragStart}
    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3 hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        {task.projectName && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            {task.projectName}
          </span>
        )}
        <h4 className="text-sm font-semibold text-slate-800 leading-snug capitalize">
          {task.title}
        </h4>
      </div>
      <button className="text-slate-400 hover:text-slate-600">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
    <div className="flex items-center justify-between mt-1">
      <span className="text-xs text-slate-500 font-medium">#{task.id}</span>
      <PriorityBadge level={task.priority || 'Medium'} />
    </div>
    <div className="flex items-center justify-between mt-2">
      <img src={task.avatar} alt="Assignee" className="w-6 h-6 rounded-full border border-slate-200 pointer-events-none" />
      {task.isCompleted ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <div className="flex items-center text-slate-400 text-xs font-medium gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {task.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  </div>
);

// --- Main Component ---
export default function KanbanBoard() {
  const [boardData, setBoardData] = useState([
    { title: 'To Do', color: 'bg-green-500', tasks: [] },
    { title: 'In Progress', color: 'bg-blue-500', tasks: [] },
    { title: 'Review', color: 'bg-orange-500', tasks: [] },
    { title: 'Completed', color: 'bg-green-500', tasks: [] }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [draggingTask, setDraggingTask] = useState(null);
  
  const [activeColumn, setActiveColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. REUSABLE GET FUNCTION
  const fetchBoardData = useCallback(async () => {
    try {
      const response = await fetch('http://103.185.75.124:8021/api/users/get_BoardsByResource?resource_id=10');
      const result = await response.json();

      if (result.success && result.data) {
        const freshColumns = [
          { title: 'To Do', color: 'bg-green-500', tasks: [] },
          { title: 'In Progress', color: 'bg-blue-500', tasks: [] },
          { title: 'Review', color: 'bg-orange-500', tasks: [] },
          { title: 'Completed', color: 'bg-green-500', tasks: [] }
        ];

        result.data.forEach((item) => {
          const mappedTask = {
            id: `BRD-${item.board_id}`, 
            title: item.sub_project_name, 
            projectName: item.project_name,
            priority: 'Medium', 
            avatar: 'https://i.pravatar.cc/150?img=47',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            isCompleted: item.status.toLowerCase() === 'completed',
            rawApiData: item
          };

          const targetCol = freshColumns.find(
            col => col.title.toLowerCase() === item.status.toLowerCase()
          );

          if (targetCol) {
            targetCol.tasks.push(mappedTask);
          } else {
            freshColumns[0].tasks.push(mappedTask);
          }
        });

        setBoardData(freshColumns);
      }
    } catch (error) {
      console.error('Error fetching board data:', error);
      alert('Failed to load board data from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. CALL GET ON COMPONENT MOUNT
  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // 3. POST FUNCTION
  const handleCreateTaskAPI = async (columnTitle) => {
    if (!newTaskTitle.trim()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('http://103.185.75.124:8021/api/users/create_board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 4,
          sub_project_id: 2, 
          status: columnTitle.toLowerCase(), 
          resource_id: 10,
          pm_id: 4,
          title: newTaskTitle.trim() 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewTaskTitle('');
        setActiveColumn(null);
        
        // 4. RE-FETCH DATA FROM SERVER AFTER SUCCESSFUL POST!
        await fetchBoardData(); 
        
      } else {
        alert('Failed to create task: ' + data.message);
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('Network error while creating task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, task, sourceColumnTitle) => {
    setDraggingTask({ task, sourceColumnTitle });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('text/plain', task.id); 
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetColumnTitle) => {
    e.preventDefault();
    if (!draggingTask || draggingTask.sourceColumnTitle === targetColumnTitle) {
      setDraggingTask(null);
      return; 
    }

    setBoardData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const sourceColIndex = newData.findIndex(col => col.title === draggingTask.sourceColumnTitle);
      const targetColIndex = newData.findIndex(col => col.title === targetColumnTitle);
      const taskIndex = newData[sourceColIndex].tasks.findIndex(t => t.id === draggingTask.task.id);
      
      const [movedTask] = newData[sourceColIndex].tasks.splice(taskIndex, 1);
      movedTask.isCompleted = targetColumnTitle === 'Completed';
      newData[targetColIndex].tasks.push(movedTask);
      
      return newData;
    });

    setDraggingTask(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center font-sans text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" /> 
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Kanban Board</h1>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {boardData.map((column, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-[300px] flex flex-col bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.title)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.color}`}></span>
                <h3 className="font-semibold text-slate-800 text-sm">{column.title}</h3>
              </div>
              <span className="text-slate-500 font-semibold text-sm">{column.tasks.length}</span>
            </div>

            {/* Task List */}
            <div className="flex flex-col gap-3 min-h-[50px] mb-3">
              {column.tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onDragStart={(e) => handleDragStart(e, task, column.title)}
                />
              ))}
            </div>

            {/* Add Task Input Area */}
            <div className="mt-auto pt-2">
              {activeColumn === column.title ? (
                <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex flex-col gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter task name..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    disabled={isSubmitting}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTaskAPI(column.title)}
                    className="w-full text-sm outline-none placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button 
                      onClick={() => { setActiveColumn(null); setNewTaskTitle(''); }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleCreateTaskAPI(column.title)}
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Add'}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveColumn(column.title)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-200/50 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}