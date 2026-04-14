import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Fuse from "fuse.js";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import ClearableInput from "../components/common/ClearableInput";

const SearchComponent = ({ mobile = false }) => {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch Categories, Services, and Blogs from Firebase
  useEffect(() => {
    const fetchCategoriesAndBlogs = async () => {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      let allItems = [];

      for (const categoryDoc of categoriesSnapshot.docs) {
        const category = { id: categoryDoc.id, ...categoryDoc.data(), type: "category" };

        const servicesSnapshot = await getDocs(collection(db, `categories/${categoryDoc.id}/services`));
        for (const serviceDoc of servicesSnapshot.docs) {
          const service = { id: serviceDoc.id, ...serviceDoc.data(), categoryId: categoryDoc.id, type: "service" };

          const subservicesSnapshot = await getDocs(collection(db, `categories/${categoryDoc.id}/services/${serviceDoc.id}/subservices`));
          const subservices = subservicesSnapshot.docs.map((subDoc) => ({
            id: subDoc.id,
            ...subDoc.data(),
            serviceId: serviceDoc.id,
            categoryId: categoryDoc.id,
            type: "subservice"
          }));

          allItems = [...allItems, category, service, ...subservices];
        }
      }

      // Fetch Blogs
      const blogsSnapshot = await getDocs(collection(db, "blogs"));
      const blogs = blogsSnapshot.docs.map(blogDoc => ({
        id: blogDoc.id,
        ...blogDoc.data(),
        type: "blog"
      }));

      allItems = [...allItems, ...blogs];
      setData(allItems);
    };

    fetchCategoriesAndBlogs();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        if (mobile) {
          setIsSearchOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobile]);

  // Handle search input changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredResults([]);
      setShowDropdown(false);
      return;
    }

    const fuse = new Fuse(data, {
      keys: ["name", "title", "subtitle"],
      threshold: 0.3,
      includeMatches: true,
    });

    const results = fuse.search(searchText).map(({ item }) => item);
    
    // Filter out duplicates based on the id
    const uniqueResults = [];
    const seenIds = new Set();
    results.forEach((item) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueResults.push(item);
      }
    });

    setFilteredResults(uniqueResults);
    setShowDropdown(true);
  }, [searchText, data]);

  // Focus on input when mobile search opens
  useEffect(() => {
    if (isSearchOpen && mobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen, mobile]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchText("");
      setShowDropdown(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === "service") {
      navigate(`/categories/${item.categoryId}/services/${item.id}`);
    } else if (item.type === "subservice") {
      navigate(`/categories/${item.categoryId}/${item.serviceId}/${item.id}`);
    } else if (item.type === "blog") {
      navigate(`/blogs/${item.id}`);
    } else {
      navigate(`/categories/${item.id}`);
    }
    setShowDropdown(false);
    setSearchText("");
    if (mobile) {
      setIsSearchOpen(false);
    }
  };

  // Mobile Search Icon Only
  if (mobile && !isSearchOpen) {
    return (
      <button
        onClick={handleSearchToggle}
        className="text-gray-700 hover:text-red-600 transition-colors p-2"
        aria-label="Search"
      >
        <FiSearch size={20} />
      </button>
    );
  }

  // Mobile Search Open State
  if (mobile && isSearchOpen) {
    return (
      <div className="fixed inset-0 bg-white z-50" ref={dropdownRef}>
        {/* Mobile Search Header */}
        <div className="flex items-center p-4 border-b">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FiSearch className="text-gray-400" />
            </div>
            <ClearableInput
              ref={searchInputRef}
              id="mobile-search-input"
              type="text"
              className="w-full pl-10 pr-10 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onClear={() => setSearchText("")}
              onFocus={() => setShowDropdown(true)}
            />
          </div>
          <button
            onClick={handleSearchToggle}
            className="ml-2 text-gray-600 hover:text-red-600 p-2"
          >
            Cancel
          </button>
        </div>

        {/* Search Results */}
        {showDropdown && (
          <div className="flex-1 overflow-y-auto">
            {filteredResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-4 py-2">
                  {filteredResults.length} results found
                </div>
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border-b hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${
                        item.type === 'blog' ? 'bg-blue-100' : 
                        item.type === 'service' ? 'bg-green-100' : 
                        item.type === 'subservice' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-xs font-semibold uppercase">
                          {item.type === 'blog' ? 'BLOG' : 
                           item.type === 'service' ? 'SVC' : 
                           item.type === 'subservice' ? 'SUB' : 'CAT'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.name || item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.type === 'blog' ? 'bg-blue-50 text-blue-600' : 
                            item.type === 'service' ? 'bg-green-50 text-green-600' : 
                            item.type === 'subservice' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchText ? (
              <div className="flex flex-col items-center justify-center h-64">
                <FiSearch className="text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">No results found for "{searchText}"</p>
                <p className="text-gray-400 text-sm mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <FiSearch className="text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">Search for services, blogs, or categories</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Searches or Empty State */}
        {!searchText && filteredResults.length === 0 && (
          <div className="p-4">
            <p className="text-gray-500 text-sm mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {["IT Services", "Blogs", "Consulting", "Training", "Support"].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchText(term)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Search Component
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <MdSearch className="text-gray-400" size={18} />
        </div>
        <ClearableInput
          id="desktop-search-input"
          type="text"
          className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-sm"
          placeholder="Search services, blogs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onClear={() => {
            setSearchText("");
            setFilteredResults([]);
            setShowDropdown(false);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </div>

      {/* Dropdown Results - Desktop */}
      {showDropdown && filteredResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2">
              {filteredResults.length} results found
            </div>
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    item.type === 'blog' ? 'bg-blue-100' : 
                    item.type === 'service' ? 'bg-green-100' : 
                    item.type === 'subservice' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-xs font-semibold uppercase">
                      {item.type === 'blog' ? 'BLOG' : 
                       item.type === 'service' ? 'SVC' : 
                       item.type === 'subservice' ? 'SUB' : 'CAT'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {item.name || item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {item.subtitle}
                      </p>
                    )}
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.type === 'blog' ? 'bg-blue-50 text-blue-600' : 
                        item.type === 'service' ? 'bg-green-50 text-green-600' : 
                        item.type === 'subservice' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results - Desktop */}
      {showDropdown && searchText && filteredResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
          <div className="text-center text-gray-500">
            <FiSearch className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No results found for "{searchText}"</p>
            <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;