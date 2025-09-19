import React from 'react';

const MexEcoBr: React.FC = () => {
  return (
    <div className="mt-6">
      <iframe
        src="http://mex.eco.br/"
        title="MAUAX consortium"
        className="w-full h-[80vh] border-0 rounded-lg shadow-lg"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default MexEcoBr;