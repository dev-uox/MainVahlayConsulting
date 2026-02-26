import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      {/* You can replace the following with any loading animation or graphic */}
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-red-600"></div>
    </div>
  );
};

export default Loading;
