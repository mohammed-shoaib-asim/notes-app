import moment from 'moment';
import React from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete } from 'react-icons/md';

const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-gray-500">{moment(date).format('Do MMM YYYY')}</span>
        </div>
        <MdOutlinePushPin
          className={`icon-btn ${isPinned ? 'text-primary' : 'text-slate-300'}`}
          onClick={onPinNote}
        />
      </div>

      {/* Content */}
      <p className="mt-2 text-xs text-slate-500">{content?.slice(0, 60)}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-500">{tags.map((item) => `#${item}`)}</div>
        <div className="flex items-center gap-2">
          <MdCreate
            className="text-gray-500 cursor-pointer"
            onClick={onEdit}
          />
          <MdDelete
            className="text-gray-500 cursor-pointer"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
