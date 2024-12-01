import React, { useState } from 'react';
import { MdAdd, MdClose } from "react-icons/md";

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addNewTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue !== '' && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      {tags?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-2 text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded "
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                title={`Remove ${tag}`}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        <input
          type="text"
          placeholder="Add tags"
          className="text-sm bg-transparent border px-3 py-2 rounded outline-none"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="w-8 h-8 flex items-center justify-center rounded border border-blue-700 hover:bg-blue-700"
          onClick={addNewTag}
          title="Add Tag"
        >
          <MdAdd className="text-2xl text-blue-700 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
