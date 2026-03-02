import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiExternalLink, FiShoppingCart, FiAward, FiVideo, FiMic, FiEdit2, FiTrash2, FiPlus, FiBookOpen, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Hardcoded initial data extracted from the Google Sites HTML.
// You can later move this to Firebase Firestore just like your Courses.
const INITIAL_BOOKS = [
  {
    id: '1',
    title: "Organizational Theory, Design and Change",
    authors: "Jones, Gareth R., Gupta, Vishal & Gopakumar, KV",
    year: "2024",
    publisher: "Pearson: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/e6e8ff/1a1a1a?text=Organizational+Theory", // Replace with actual cover image
    amazonLink: "https://www.amazon.in/Organizational-Theory-Design-Change-Revised/dp/9361597256",
    flipkartLink: "",
    reviews: [
      {
        text: "Read the book review by Deepak Bhatt, Group Senior Vice-President, Gujarat, BW Businessworld Media Private Limited",
        link: "https://www.deepakbbhatt.com/post/book-review-75-amazing-indians-who-made-a-difference-a-tribute-to-india-s-trailblazers"
      }
    ],
    media: [],
    awards: []
  },
  {
    id: '2',
    title: "75 Amazing Indians Who Made a Difference",
    authors: "Gupta, Vishal K. & Gupta, Vishal",
    year: "2024",
    publisher: "Vitasta Publishing: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/fff7ed/1a1a1a?text=75+Amazing+Indians", // Replace with actual cover image
    amazonLink: "https://www.amazon.in/Amazing-Indians-Who-Made-Difference/dp/811967099X",
    flipkartLink: "https://www.flipkart.com/75-amazing-indians-made-difference/p/itm8606d83f38c0b?pid=9788119670994",
    reviews: [],
    media: [
      { type: 'video', text: "Conversation on the book at IIM Ahmedabad (August, 2021)", link: "https://www.youtube.com/watch?v=GNp7Z_75cRM" },
      { type: 'podcast', text: "Podcast on the book with Secrets of Storytellers (December, 2021)", link: "https://open.spotify.com/embed-podcast/episode/3Lg5ID3kgYuFYtBdrKwFF9" },
      { type: 'video', text: "Talk on the book at IIM Ranchi", link: "https://www.youtube.com/watch?v=toiEi6lzZwE&t=36s" }
    ],
    awards: []
  },
  {
    id: '3',
    title: "Demystifying Leadership: Unveiling the Mahabharata Code",
    authors: "Kaul, A. & Gupta, V.",
    year: "2021",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/e6e8ff/1a1a1a?text=Demystifying+Leadership", // Replace with actual cover image
    amazonLink: "https://www.amazon.in/Demystifying-Leadership-Unveiling-Mahabharata-Code-ebook/dp/B095RFN1XC",
    flipkartLink: "",
    reviews: [],
    media: [],
    awards: [
      { text: "Business Book of the Year award in 'Business Management' category by FICCI (2022)", link: "https://ficci.in/pressrelease-page.asp?nid=4501" }
    ]
  },
  {
    id: '4',
    title: "First Among Equals: TREAT Leadership for LEAP in a Knowledge-based World",
    authors: "Gupta, V.",
    year: "2020",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/fff7ed/1a1a1a?text=First+Among+Equals", // Replace with actual cover image
    amazonLink: "https://www.bloomsbury.com/in/first-among-equals-9789387471207/",
    flipkartLink: "",
    reviews: [
      { text: "Book review published in the South Asian Journal of Human Resources Management (SAJHRM)", link: "https://journals.sagepub.com/doi/full/10.1177/23220937211010231" },
      { text: "Book review published in People Matters", link: "https://www.peoplematters.in/blog/sports-books-movies/first-among-equals-t-r-e-a-t-leadership-for-l-e-a-p-in-a-knowledge-based-world-27720" },
      { text: "Book review published in BusinessWorld", link: "http://bwpeople.businessworld.in/article/First-Among-Equals-T-R-E-A-T-Leadership-for-L-E-A-P-in-a-Knowledge-Based-World-Prof-Vishal-Gupta-IIM-Ahmedabad-/16-07-2021-396895/" }
    ],
    media: [
      { type: 'video', text: "Conversation on the book at Ahmedabad University (July 31, 2021)", link: "https://www.youtube.com/watch?v=3nN_AF7NTEg" }
    ],
    awards: []
  }
];

// Function to fetch books from Firestore
const fetchBooks = async () => {
  try {
    console.log('Fetching books from Firestore...');
    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('published', '==', true));
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} books in Firestore`);
    
    const books = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Book data:', doc.id, data.title);
      return { id: doc.id, ...data };
    });
    
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Function to add a new book
const addBook = async (book, file) => {
  try {
    console.log('Adding new book:', book.title);
    let coverUrl = book.coverUrl || '';
    
    if (file) {
      console.log('Uploading cover image...');
      coverUrl = await uploadToCloudinary(file, 'books');
      console.log('Image uploaded:', coverUrl);
    }
    
    // Clean and sanitize all data
    const bookData = { 
      title: String(book.title || ''),
      authors: String(book.authors || ''),
      year: String(book.year || ''),
      publisher: String(book.publisher || ''),
      coverUrl: String(coverUrl),
      amazonLink: String(book.amazonLink || ''),
      flipkartLink: String(book.flipkartLink || ''),
      reviews: Array.isArray(book.reviews) 
        ? book.reviews.map(r => ({
            text: String(r.text || ''),
            link: String(r.link || '')
          }))
        : [],
      media: Array.isArray(book.media) 
        ? book.media.map(m => ({
            type: String(m.type || 'video'),
            text: String(m.text || ''),
            link: String(m.link || '')
          }))
        : [],
      awards: Array.isArray(book.awards) 
        ? book.awards.map(a => ({
            text: String(a.text || ''),
            link: String(a.link || '')
          }))
        : [],
      published: true,
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving to Firestore with cleaned data:', bookData);
    const docRef = await addDoc(collection(db, 'books'), bookData);
    console.log('Book added successfully with ID:', docRef.id);
    alert('Book added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding book:', error);
    alert(`Error adding book: ${error.message}`);
    throw error;
  }
};

// Function to add a book with a specific ID (for migrating hardcoded books)
const addBookWithId = async (id, book, file) => {
  try {
    console.log('Adding book with specific ID:', id, book.title);
    let coverUrl = book.coverUrl || '';
    
    if (file) {
      console.log('Uploading cover image...');
      coverUrl = await uploadToCloudinary(file, 'books');
      console.log('Image uploaded:', coverUrl);
    }
    
    // Clean and sanitize all data
    const bookData = { 
      title: String(book.title || ''),
      authors: String(book.authors || ''),
      year: String(book.year || ''),
      publisher: String(book.publisher || ''),
      coverUrl: String(coverUrl),
      amazonLink: String(book.amazonLink || ''),
      flipkartLink: String(book.flipkartLink || ''),
      reviews: Array.isArray(book.reviews) 
        ? book.reviews.map(r => ({
            text: String(r.text || ''),
            link: String(r.link || '')
          }))
        : [],
      media: Array.isArray(book.media) 
        ? book.media.map(m => ({
            type: String(m.type || 'video'),
            text: String(m.text || ''),
            link: String(m.link || '')
          }))
        : [],
      awards: Array.isArray(book.awards) 
        ? book.awards.map(a => ({
            text: String(a.text || ''),
            link: String(a.link || '')
          }))
        : [],
      published: true,
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating Firestore document with ID:', id);
    await setDoc(doc(db, 'books', id), bookData);
    console.log('Book created successfully with ID:', id);
    alert('Book saved successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding book with ID:', error);
    alert(`Error saving book: ${error.message}`);
    throw error;
  }
};

// Function to update a book
const updateBook = async (id, updatedBook, file) => {
  try {
    // Convert ID to string - Firestore requires string IDs
    const bookId = String(id);
    console.log('Updating book:', bookId, updatedBook.title);
    let coverUrl = updatedBook.coverUrl || '';
    
    if (file) {
      console.log('Uploading new cover image...');
      coverUrl = await uploadToCloudinary(file, 'books');
      console.log('Image uploaded:', coverUrl);
    }
    
    // Clean and sanitize all data - remove id and any Firestore metadata
    const bookData = {
      title: String(updatedBook.title || ''),
      authors: String(updatedBook.authors || ''),
      year: String(updatedBook.year || ''),
      publisher: String(updatedBook.publisher || ''),
      coverUrl: String(coverUrl),
      amazonLink: String(updatedBook.amazonLink || ''),
      flipkartLink: String(updatedBook.flipkartLink || ''),
      reviews: Array.isArray(updatedBook.reviews) 
        ? updatedBook.reviews.map(r => ({
            text: String(r.text || ''),
            link: String(r.link || '')
          }))
        : [],
      media: Array.isArray(updatedBook.media) 
        ? updatedBook.media.map(m => ({
            type: String(m.type || 'video'),
            text: String(m.text || ''),
            link: String(m.link || '')
          }))
        : [],
      awards: Array.isArray(updatedBook.awards) 
        ? updatedBook.awards.map(a => ({
            text: String(a.text || ''),
            link: String(a.link || '')
          }))
        : [],
      published: true,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Updating Firestore document with cleaned data:', bookData);
    await updateDoc(doc(db, 'books', bookId), bookData);
    console.log('Book updated successfully');
    alert('Book updated successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error updating book:', error);
    alert(`Error updating book: ${error.message}`);
    throw error;
  }
};

// Function to delete a book
const deleteBook = async (id) => {
  try {
    // Convert ID to string - Firestore requires string IDs
    const bookId = String(id);
    console.log('Deleting book:', bookId);
    await deleteDoc(doc(db, 'books', bookId));
    console.log('Book deleted successfully');
    alert('Book deleted successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    alert(`Error deleting book: ${error.message}`);
    throw error;
  }
};

// Admin editing functionality
const AdminBookControls = ({ book, onEdit, onDelete }) => (
  <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
    <button
      onClick={() => onEdit(book)}
      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
    >
      <FiEdit2 size={16} />
    </button>
    <button
      onClick={() => onDelete(book.id)}
      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
    >
      <FiTrash2 size={16} />
    </button>
  </div>
);

// Book Edit Modal Component
const BookEditModal = ({ book, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    authors: book?.authors || '',
    year: book?.year || '',
    publisher: book?.publisher || '',
    coverUrl: book?.coverUrl || '',
    amazonLink: book?.amazonLink || '',
    flipkartLink: book?.flipkartLink || '',
    reviews: Array.isArray(book?.reviews) ? book.reviews : [],
    media: Array.isArray(book?.media) ? book.media : [],
    awards: Array.isArray(book?.awards) ? book.awards : []
    // Note: We deliberately do NOT include 'id' or any Firestore metadata
  });
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploading(true);
    
    try {
      console.log('Raw form data:', formData);
      
      // Validate and clean the data - ensure all values are proper types
      const cleanedData = {
        title: formData.title || '',
        authors: formData.authors || '',
        year: formData.year || '',
        publisher: formData.publisher || '',
        coverUrl: formData.coverUrl || '',
        amazonLink: formData.amazonLink || '',
        flipkartLink: formData.flipkartLink || '',
        reviews: Array.isArray(formData.reviews) 
          ? formData.reviews.filter(r => r && (r.text || r.link))
          : [],
        media: Array.isArray(formData.media) 
          ? formData.media.filter(m => m && (m.text || m.link))
          : [],
        awards: Array.isArray(formData.awards) 
          ? formData.awards.filter(a => a && (a.text || a.link))
          : []
      };
      
      console.log('Cleaned form data:', cleanedData);
      await onSave(cleanedData, coverFile);
      // Don't close here - let the parent component close on success
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addArrayItem = (field, item) => {
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    setFormData({ ...formData, [field]: [...currentArray, item] });
  };

  const removeArrayItem = (field, index) => {
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    setFormData({ 
      ...formData, 
      [field]: currentArray.filter((_, i) => i !== index) 
    });
  };

  const updateArrayItem = (field, index, key, value) => {
    const currentArray = Array.isArray(formData[field]) ? formData[field] : [];
    const updated = [...currentArray];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, [field]: updated });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Authors *</label>
              <input
                type="text"
                required
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Year *</label>
                <input
                  type="text"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Publisher *</label>
                <input
                  type="text"
                  required
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {coverFile && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">New image selected: {coverFile.name}</p>
                  <img 
                    src={URL.createObjectURL(coverFile)} 
                    alt="Preview" 
                    className="mt-2 h-32 rounded-lg object-cover"
                  />
                </div>
              )}
              {formData.coverUrl && !coverFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current cover:</p>
                  <img src={formData.coverUrl} alt="Current cover" className="mt-2 h-32 rounded-lg object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Amazon Link</label>
                <input
                  type="url"
                  value={formData.amazonLink}
                  onChange={(e) => setFormData({ ...formData, amazonLink: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Flipkart Link</label>
                <input
                  type="url"
                  value={formData.flipkartLink}
                  onChange={(e) => setFormData({ ...formData, flipkartLink: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Reviews</label>
              <button
                type="button"
                onClick={() => addArrayItem('reviews', { text: '', link: '' })}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiPlus />
              </button>
            </div>
            {Array.isArray(formData.reviews) && formData.reviews.map((review, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Review text"
                  value={review.text || ''}
                  onChange={(e) => updateArrayItem('reviews', idx, 'text', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="url"
                  placeholder="Review link"
                  value={review.link || ''}
                  onChange={(e) => updateArrayItem('reviews', idx, 'link', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('reviews', idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Media */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Media & Talks</label>
              <button
                type="button"
                onClick={() => addArrayItem('media', { type: 'video', text: '', link: '' })}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiPlus />
              </button>
            </div>
            {Array.isArray(formData.media) && formData.media.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={item.type || 'video'}
                  onChange={(e) => updateArrayItem('media', idx, 'type', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                </select>
                <input
                  type="text"
                  placeholder="Media text"
                  value={item.text || ''}
                  onChange={(e) => updateArrayItem('media', idx, 'text', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="url"
                  placeholder="Media link"
                  value={item.link || ''}
                  onChange={(e) => updateArrayItem('media', idx, 'link', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('media', idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Awards */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold">Awards</label>
              <button
                type="button"
                onClick={() => addArrayItem('awards', { text: '', link: '' })}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiPlus />
              </button>
            </div>
            {Array.isArray(formData.awards) && formData.awards.map((award, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Award text"
                  value={award.text || ''}
                  onChange={(e) => updateArrayItem('awards', idx, 'text', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="url"
                  placeholder="Award link"
                  value={award.link || ''}
                  onChange={(e) => updateArrayItem('awards', idx, 'link', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('awards', idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Books() {
  const { isAdmin } = useAuth() || {};
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load books from Firestore
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    console.log('Loading books...');
    try {
      const booksData = await fetchBooks();
      console.log('Books loaded:', booksData.length);
      
      if (booksData.length === 0) {
        console.log('No books in Firestore, using initial hardcoded data');
        setBooks(INITIAL_BOOKS);
      } else {
        console.log('Setting books from Firestore');
        setBooks(booksData);
      }
    } catch (error) {
      console.error('Error loading books:', error);
      console.log('Falling back to initial hardcoded data');
      setBooks(INITIAL_BOOKS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (bookData, file) => {
    try {
      await addBook(bookData, file);
      await loadBooks();
      setShowAddModal(false); // Close modal on success
    } catch (error) {
      console.error('Failed to add book:', error);
      // Modal stays open so user can try again
    }
  };

  const handleUpdateBook = async (bookData, file) => {
    try {
      const bookId = String(editingBook.id);
      
      // Check if this is a hardcoded book (Firestore is empty)
      // If document doesn't exist in Firestore, create it instead of updating
      const booksData = await fetchBooks();
      const existsInFirestore = booksData.some(b => b.id === bookId);
      
      if (!existsInFirestore) {
        console.log('Book not in Firestore, creating new document...');
        // Create the book in Firestore with the same ID
        await addBookWithId(bookId, bookData, file);
      } else {
        console.log('Updating existing Firestore document...');
        await updateBook(bookId, bookData, file);
      }
      
      await loadBooks();
      setEditingBook(null); // Close modal on success
    } catch (error) {
      console.error('Failed to update book:', error);
      // Modal stays open so user can try again
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(id);
        await loadBooks();
      } catch (error) {
        console.error('Failed to delete book:', error);
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const viewportOptions = {
    once: true,
    margin: "0px 0px -50px 0px",
    amount: 0.1
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Modals */}
      {showAddModal && (
        <BookEditModal
          book={null}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddBook}
        />
      )}
      {editingBook && (
        <BookEditModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={handleUpdateBook}
        />
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#e6e8ff] to-[#fff7ed] py-20 px-6 lg:px-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              Books Authored
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              Explore my published works bridging organizational theory, leadership dynamics, and ancient wisdom for the modern world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-xl text-gray-600">Loading books...</div>
        </div>
      ) : (
        // Main Content - Safal Niveshak Layout Style
        <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-5xl mx-auto">
          
          {isAdmin && (
            <div className="flex justify-end mb-12">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-[#2A35CC] hover:bg-[#1f2a99] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
              >
                <FiPlus /> Add New Book
              </button>
            </div>
          )}

          <div className="space-y-24">
            {books.map((book, index) => (
              <motion.div 
                key={book.id}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
                variants={fadeInUp}
                className="flex flex-col md:flex-row gap-10 lg:gap-16 pb-24 border-b border-gray-200 last:border-b-0 relative group"
              >
                {/* Admin Controls */}
                {isAdmin && (
                  <AdminBookControls
                    book={book}
                    onEdit={setEditingBook}
                    onDelete={handleDeleteBook}
                  />
                )}

                {/* Left Column: Book Cover */}
                <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                  <div className="rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:-translate-y-2 border border-gray-100 bg-gray-50 aspect-[2/3] relative">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Column: Book Details */}
                <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-center">
                  <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 leading-tight">
                    {book.title}
                  </h2>
                  
                  <div className="mb-6 space-y-2 font-['Inter']">
                    <p className="text-lg text-gray-800">
                      <span className="font-semibold text-gray-900">Authors:</span> {book.authors}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Published:</span> {book.publisher} ({book.year})
                    </p>
                  </div>

                  {/* Badges/Awards */}
                  {book.awards && book.awards.length > 0 && (
                    <div className="mb-6">
                      {book.awards.map((award, i) => (
                        <div key={i} className="inline-flex items-start gap-2 p-4 bg-[#fff7ed] border-l-4 border-[#f97316] rounded-r-lg">
                          <FiAward className="w-6 h-6 text-[#f97316] shrink-0 mt-0.5" />
                          <a href={award.link} target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] font-['Inter'] font-medium hover:text-[#f97316] transition-colors">
                            {award.text}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reviews List */}
                  {book.reviews && book.reviews.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiBookOpen className="text-[#2A35CC]" /> Selected Reviews
                      </h4>
                      <ul className="space-y-2">
                        {book.reviews.map((review, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2A35CC] mt-2.5 shrink-0"></div>
                            <a href={review.link} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-['Inter'] hover:text-[#2A35CC] transition-colors leading-relaxed">
                              {review.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Media / Talks List */}
                  {book.media && book.media.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiVideo className="text-[#f97316]" /> Talks & Media
                      </h4>
                      <ul className="space-y-2">
                        {book.media.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            {item.type === 'video' ? (
                              <FiVideo className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            ) : (
                              <FiMic className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            )}
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-['Inter'] hover:text-[#f97316] transition-colors leading-relaxed">
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 mt-auto pt-6">
                    {book.amazonLink && (
                      <a
                        href={book.amazonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A35CC] hover:bg-[#1f2a99] text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        <FiShoppingCart /> Get it on Amazon
                      </a>
                    )}
                    {book.flipkartLink && (
                      <a
                        href={book.flipkartLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#2A35CC] text-[#2A35CC] hover:bg-[#e6e8ff] font-['Inter'] font-semibold rounded-lg transition-all"
                      >
                        <FiShoppingCart /> Get it on Flipkart
                      </a>
                    )}
                  </div>
                  
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
      )}
    </div>
  );
}