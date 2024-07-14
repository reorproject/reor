import React, { useState } from 'react';

import { Button } from '@material-tailwind/react';

import ReorModal from '../Common/Modal';

import DirectorySelector from './DirectorySelector';
import InitialEmbeddingModelSettings from './EmbeddingSettings/InitialEmbeddingSettings';
import LLMSettings from './LLMSettings/LLMSettings';

interface OldInitialSettingsProps {
  readyForIndexing: () => void;
}

const InitialSetupSinglePage: React.FC<OldInitialSettingsProps> = ({
  readyForIndexing,
}) => {
  const [directoryErrorMsg, setDirectoryErrorMsg] = useState('');
  const [embeddingErrorMsg, setEmbeddingErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (!directoryErrorMsg && !embeddingErrorMsg) {
      readyForIndexing();
    } else {
      setShowError(true);
    }
  };

  return (
    <ReorModal
      isOpen
      onClose={() => console.log('Not allowing a close for now')}
      hideCloseButton
    >
      <div className='w-[620px] mr-4 ml-2 py-3'>
        <div className='ml-2 mt-0 h-[450px]  '>
          <h2 className='text-2xl font-semibold mb-0 text-white text-center'>
            Welcome to the Reor Project.
          </h2>
          <p className='mt-2 text-gray-100 text-center'>
            Reor is a private AI personal knowledge management tool. Each note
            will be saved as a markdown file to a &quot;vault&quot; directory on
            your machine.
          </p>
          <div className='flex justify-between items-center mt-10 border-b-2 border-solid border-neutral-700 border-0 pb-4'>
            <div className='flex-col w-80'>
              <p className='text-gray-100 m-0'>Vault Directory</p>
              <p className='text-xs text-gray-100 w-50 m-0 pt-1 opacity-40'>
                Your vault directory doesn&apos;t need to be empty. Only
                markdown files will be indexed.
              </p>
            </div>
            <div className='flex-col'>
              <DirectorySelector setErrorMsg={setDirectoryErrorMsg} />
              {showError && directoryErrorMsg && (
                <p className='text-xs text-red-500'>{directoryErrorMsg}</p>
              )}
            </div>
          </div>

          <div className='mt-2 border-b-2 border-solid border-neutral-700 border-0 pb-2'>
            <InitialEmbeddingModelSettings setErrorMsg={setEmbeddingErrorMsg} />
            {showError && embeddingErrorMsg && (
              <p className='text-xs text-red-500'>{embeddingErrorMsg}</p>
            )}
          </div>
          <LLMSettings isInitialSetup />
        </div>
        <div className='flex justify-end'>
          <Button
            className='bg-blue-500 mt-4 mb-3  border-none h-10 hover:bg-blue-600 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2'
            onClick={handleNext}
            placeholder=''
          >
            Next
          </Button>
        </div>
      </div>
    </ReorModal>
  );
};

export default InitialSetupSinglePage;
