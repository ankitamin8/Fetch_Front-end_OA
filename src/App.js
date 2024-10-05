import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaStar, FaDog } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const galleryRef = useRef(null);
  const [isBreedSelection, setIsBreedSelection] = useState(false);

  useEffect(() => {
    const fetchBreeds = async () => {
      const response = await axios.get('https://dog.ceo/api/breeds/list/all');
      const breedList = Object.keys(response.data.message).map(breed => ({
        label: breed.charAt(0).toUpperCase() + breed.slice(1),
        value: breed,
      }));
      setBreeds(breedList);
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    if (selectedBreeds.length > 0 && !showFavorites) {
      const fetchImages = async () => {
        setLoading(true);
        const allImages = await Promise.all(
          selectedBreeds.map(async (breed) => {
            const response = await axios.get(`https://dog.ceo/api/breed/${breed.value}/images/random/5`);
            return { breed: breed.value, images: response.data.message };
          })
        );
        const flatImages = allImages.flatMap((breedData) =>
          breedData.images.map((image) => ({ breed: breedData.breed, url: image }))
        );
        setImages(flatImages);
        setLoading(false);
      };

      fetchImages();
    } else if (showFavorites) {
      setImages(favorites);
    }
  }, [selectedBreeds, showFavorites]);

  const toggleFavorite = (imageObj) => {
    const existsInFavorites = favorites.some(fav => fav.url === imageObj.url);
  
    if (existsInFavorites) {
      const updatedFavorites = favorites.filter(fav => fav.url !== imageObj.url);
      setFavorites(updatedFavorites);
  
      if (showFavorites) {
        setImages(updatedFavorites);
      }
    } else {
      setFavorites([...favorites, imageObj]);
    }
  };  

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const handleDropdownChange = (selectedOption) => {
    if (selectedOption.value === 'showFavorites') {
      setShowFavorites(true);
      setSelectedBreeds([]);
      setIsBreedSelection(false);
    } else if (selectedOption.value === 'selectBreed') {
      setShowFavorites(false);
      setIsBreedSelection(true);
    }
  };

  const handleBreedSelection = (selectedOptions) => {
    setSelectedBreeds(selectedOptions);
  };

  const customDropdownOptions = [
    {
      label: (
        <span>
          <FaStar /> Show Starred
        </span>
      ),
      value: 'showFavorites',
    },
    {
      label: (
        <span>
          <FaDog /> Select Dog Breed
        </span>
      ),
      value: 'selectBreed',
    },
  ];

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '10px',
      boxShadow: '0 3px 15px rgba(0, 0, 0, 0.1)',
      padding: '10px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#f5f5f5',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? '#00A3FF'
        : isFocused
        ? '#E2E8F0'
        : null,
      color: isSelected ? '#fff' : '#333',
      padding: 15,
      cursor: 'pointer',
      fontSize: '16px',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isSelected ? '#CBD5E1' : '#00A3FF',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
      padding: '5px',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
      fontSize: '18px',
    }),
  };

  return (
    <div className="App">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>
      <div className="circle circle4"></div>
      <div className="circle circle5"></div>

      <h1>Dog Breed Image <span className="rainbow-text">Gallery</span></h1>

      <Select
        options={customDropdownOptions}
        className="breed-selector"
        placeholder="Select Dog Breeds or Show Starred..."
        onChange={handleDropdownChange}
        styles={customStyles}
      />

      {isBreedSelection && (
        <Select
          isMulti
          options={breeds}
          className="breed-selector"
          placeholder="Select Dog Breeds..."
          onChange={handleBreedSelection}
          styles={customStyles}
        />
      )}

      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="gallery-container">
          <button className="scroll-button scroll-button-left" onClick={() => scrollGallery('left')}>{'<'}</button>
          <div className="gallery" ref={galleryRef}>
            {images.map((imageObj, index) => (
              <div
                key={index}
                className="image-card"
                onMouseEnter={() => setHoveredImage(imageObj.url)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <img src={imageObj.url} alt={`${imageObj.breed} dog`} />
                <div className="card-content">
                  <p className="breed-name">{imageObj.breed}</p>
                  <button
                    className={`star-button ${favorites.some(fav => fav.url === imageObj.url) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(imageObj)}
                    title="Add to Starred"
                  >
                    ★
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="scroll-button scroll-button-right" onClick={() => scrollGallery('right')}>{'>'}</button>
        </div>
      )}

      {hoveredImage && (
        <div className="hover-popup">
          <img src={hoveredImage} alt="Hovered dog" />
        </div>
      )}
    </div>
  );
};

export default App;
