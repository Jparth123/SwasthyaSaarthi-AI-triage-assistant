import React, { useState } from 'react';
import { useTravelPlan } from '../../context/TravelPlanContext.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import BottomSheetPicker from '../ui/BottomSheetPicker.jsx';
import { ITEM_TYPES } from '../../types/stateTypes.js';
import { convertCurrency } from '../../services/currencyService.js';

const ACTIVITY_TYPES = [
  { value: 'activity',  label: 'Activity / Sight',  meta: 'Museums, Temples, Gardens' },
  { value: 'meal',      label: 'Dining / Meal',      meta: 'Restaurants, Street food' },
  { value: 'transport', label: 'Transit / Rail',     meta: 'Shinkansen, Subway, Bus' },
  { value: 'lodging',   label: 'Lodging / Check-in', meta: 'Hotels, Ryokans, Hostels' },
];

export default function AddActivityModal() {
  const { isAddActivityOpen, setIsAddActivityOpen, state, executeNLP, selectedCurrency } = useTravelPlan();
  const days = state.itinerary?.days || [];

  const [targetDay, setTargetDay] = useState(1);
  const [title, setTitle] = useState('');
  const [type, setType] = useState(ITEM_TYPES.ACTIVITY);
  const [time, setTime] = useState('14:00');
  const [cost, setCost] = useState('2500');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');

  const handleClose = () => {
    setIsAddActivityOpen(false);
    setTitle('');
    setDescription('');
    setLocationName('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert cost back to JPY if needed
    const costInJPY = selectedCurrency === 'JPY'
      ? parseInt(cost, 10) || 0
      : Math.round(convertCurrency(parseInt(cost, 10) || 0, selectedCurrency, 'JPY'));

    executeNLP(`Add ${type} "${title}" to Day ${targetDay} at ${time} with cost ${costInJPY} yen. ${description}`);
    handleClose();
  };

  // Build day options for BottomSheetPicker
  const dayOptions = days.map((d) => ({
    value: d.dayNumber,
    label: `Day ${d.dayNumber}: ${d.title}`,
    meta: d.location,
  }));

  return (
    <Modal
      isOpen={isAddActivityOpen}
      onClose={handleClose}
      title="Add Itinerary Experience"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Day Selector — Bottom Sheet Picker */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-2">
            Target Day
          </label>
          <BottomSheetPicker
            label="Target Day"
            value={targetDay}
            onChange={(val) => setTargetDay(parseInt(val, 10))}
            options={dayOptions}
            placeholder="Select a day…"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">
            Activity / Sights Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Traditional Tea Whisking Ceremony in Gion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px]"
          />
        </div>

        {/* Type & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 font-semibold mb-2">
              Category
            </label>
            {/* Bottom Sheet Picker for type */}
            <BottomSheetPicker
              label="Activity Category"
              value={type}
              onChange={(val) => setType(val)}
              options={ACTIVITY_TYPES}
              placeholder="Pick category…"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Start Time
            </label>
            <input
              type="text"
              placeholder="14:00"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Cost & Location Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Estimated Cost ({selectedCurrency})
            </label>
            <input
              type="number"
              placeholder="2500"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Location Landmark
            </label>
            <input
              type="text"
              placeholder="e.g., Gion Shirakawa"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-zinc-300 font-semibold mb-1">
            Notes / Description
          </label>
          <textarea
            rows="2"
            placeholder="Special booking instructions or highlights..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="allow-select w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Add to Itinerary
          </Button>
        </div>
      </form>
    </Modal>
  );
}
