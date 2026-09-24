import React, { useState, useEffect } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function EditActivityModal() {
  const { editingItem, setEditingItem, updateItemInline } = useTravelPlan();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setStartTime(editingItem.startTime || '09:00');
      setEndTime(editingItem.endTime || '10:30');
      setCost(String(editingItem.cost || 0));
      setDescription(editingItem.description || '');
    }
  }, [editingItem]);

  if (!editingItem) return null;

  const handleClose = () => {
    setEditingItem(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateItemInline(editingItem.dayNumber, editingItem.id, {
      title,
      startTime,
      endTime,
      cost: parseInt(cost, 10) || 0,
      description,
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={Boolean(editingItem)}
      onClose={handleClose}
      title="Edit Activity Details"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">
            Experience Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-500 min-h-[44px]"
          />
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Start Time
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              End Time
            </label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Cost */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">
            Cost (Base JPY)
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-500 min-h-[44px]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">
            Description
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-white outline-none focus:border-red-500"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
