import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from "react-icons/md";
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/ToastMessage/Toast';
import AddNotesImg from '../../assets/images/add-notes.svg';
import NoDataImg from "../../assets/images/no-data.svg";
import EmptyCard from '../../components/EmptyCard/EmptyCard';

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  // Handle opening of the edit modal
  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      type: 'edit',
      data: noteDetails,
    });
  };

  // Show toast message
  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  // Handle closing the toast
  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  // Fetch user information
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Fetch all notes
  const getAllNotes = async () => {
    try {
        const response = await axiosInstance.get("/get-notes"); // Make sure the endpoint matches the backend
        if (response.data && response.data.notes) {
            setAllNotes(response.data.notes);
        }
    } catch (error) {
        console.log("An unexpected error occurred while fetching notes:", error);
    }
};


  // Delete a note
  const deleteNote = async (data) => {
    // Validate the data object and its _id field
    if (!data || !data._id) {
        console.error("Invalid data passed to deleteNote:", data);
        showToastMessage("Failed to delete note. Invalid note data.", "error");
        return;
    }

    const noteId = data._id;

    try {
        console.log("Attempting to delete note with ID:", noteId);

        // Make DELETE API call
        const response = await axiosInstance.delete(`/delete-note/${noteId}`);
        
        // Handle successful response
        if (response.data && !response.data.error) {
            showToastMessage("Note deleted successfully", 'delete');
            getAllNotes(); // Refresh the notes list
            // onclose(); // Close any related UI
        }
    } catch (error) {
        // Handle errors gracefully
        console.error("Error occurred while deleting note:", error);
        showToastMessage("An unexpected error occurred while deleting note. Please try again later.", "error");
    }
};


  // Search for notes
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get('/search-notes/', {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update pinned status of a note
  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put('/update-note-pinned/' + noteId, {
        isPinned: !noteData.isPinned,
      });
      if (response.data && response.data.note) {
        showToastMessage("Note pinned successfully", 'pin');
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Clear search results
  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  // Fetch user info and all notes on component mount
  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />
    
      <div className='container mx-auto'>
        {allNotes.length > 0 ? (
          <div className='grid grid-cols-3 gap-4 mt-8'>
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => { handleEdit(item); }}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard 
            imgSrc={isSearch ? NoDataImg : AddNotesImg} 
            message={
              isSearch ? `No results found` : 
              `Start creating your first note! Click the 'Add' button 
               to jot down your thoughts, ideas, and reminders. Let's get started!`
            }
          />
        )}
      </div>

      <button 
        className="w-16 h-16 rounded-2xl flex items-center justify-center
                   bg-primary hover:bg-blue-600 
                   absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: 'add',
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal 
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: { backgroundColor: 'rgba(0,0,0,0.2)' },
        }}
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
        contentLabel=""
        appElement={document.getElementById('root')}
      >  
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({
              isShown: false,
              type: 'add',
              data: null,
            });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
