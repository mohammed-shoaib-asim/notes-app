import React, { useState } from 'react';
import TagInput from '../../components/Input/TagInput';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';

const AddEditNotes = ({ noteData, type, getAllNotes, onClose, showToastMessage }) => {
  const [title, setTitle] = useState(noteData?.title || '');
  const [content, setContent] = useState(noteData?.content || '');
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);

  // Add new note
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post('/add-note', {
        title,
        content,
        tags,
      });
      if (response.data && response.data.note) {
        showToastMessage('Note Added successfully');
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
    }
  };








  const editNote = async () => {
  

    const noteId = noteData && noteData._id;
    if (!noteId) {
        setError("Note ID is missing.");
        return;
    }

    

    try {
        const response = await axiosInstance.put(`/edit-note/${noteId}`, {
            title,
            content,
            tags,
            isPinned: noteData.isPinned, // Use the existing value if isPinned isn't being edited
        });

        if (response.data && response.data.note) {
            showToastMessage('Note updated successfully');
            getAllNotes();
            onClose();
        } else {
            setError("Failed to update the note.");
        }
    } catch (error) {
        console.error("Error updating note:", error);
        if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError("An error occurred while updating the note.");
        }
    }
};








  const handleAddNote = () => {
    if (!title) {
      setError('Title is required');
      return;
    }
    if (!content) {
      setError('Content is required');
      return;
    }
    if (!tags.length) {
      setError('At least one tag is required');
      return;
    }
    setError('');

    if (type === 'add') {
      addNewNote();
    } else if (type === 'edit') {
      editNote();
    }
  };

  return (
    <div className='relative'>
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50"
        onClick={onClose}
      >
        <MdClose className="text-xl text-slate-400" />
      </button>

      <div className='flex flex-col gap-2'>
        <label className='input-label'>TITLE</label>
        <input
          type='text'
          className='text-2xl text-slate-950 outline-none'
          placeholder='Enter title'
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div className='flex flex-col gap-2 mt-4'>
        <label className='input-label'>DESCRIPTION</label>
        <textarea
          type='text'
          className='text-sm text-slate-950 outline-none  bg-slate-50 p-2 rounded-md'
          placeholder='content.'
          rows={10}
          value={content}
          onChange={({ target }) => setContent(target.value)}
        />
      </div>

      <div className='mt-3'>
        <label className='input-label'>TAGS</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <div className='text-red-500 text-sm'>{error}</div>}

      <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote}>
        {type === 'edit' ? 'UPDATE' : 'ADD'}
      </button>
    </div>
  );
};

export default AddEditNotes;
