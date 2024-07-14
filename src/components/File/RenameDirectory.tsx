import React, { useEffect, useState } from 'react';

import { Button } from '@material-tailwind/react';
import { toast } from 'react-toastify';

import ReorModal from '../Common/Modal';

import { errorToStringRendererProcess } from '@/utils/error';
import { getInvalidCharacterInFileName } from '@/utils/strings';

export interface RenameDirFuncProps {
  path: string;
  newDirName: string;
}

interface RenameDirModalProps {
  isOpen: boolean;
  fullDirName: string;
  onClose: () => void;
  renameDir: (props: RenameDirFuncProps) => Promise<void>;
}

const RenameDirModal: React.FC<RenameDirModalProps> = ({
  isOpen,
  fullDirName,
  onClose,
  renameDir,
}) => {
  useEffect(() => {
    const setDirectoryUponNoteChange = async () => {
      const initialDirPathPrefix = await window.path.dirname(fullDirName);
      setDirPrefix(initialDirPathPrefix);
      const trimmedInitialDirName = await window.path.basename(fullDirName);
      setDirName(trimmedInitialDirName);
    };

    setDirectoryUponNoteChange();
  }, [fullDirName]);

  const [isUpdatingDirName, setIsUpdatingDirName] = useState<boolean>(false);

  const [dirPrefix, setDirPrefix] = useState<string>('');
  const [dirName, setDirName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setDirName(newName);

    getInvalidCharacterInFileName(newName).then((invalidCharacter) => {
      if (invalidCharacter) {
        setErrorMessage(
          `The character [${invalidCharacter}] cannot be included in directory name.`,
        );
      } else {
        setErrorMessage(null);
      }
    });
  };

  const sendDirRename = async () => {
    try {
      if (errorMessage) {
        return;
      }
      if (!dirName) {
        toast.error('Directory name cannot be empty', {
          className: 'mt-5',
          closeOnClick: false,
          draggable: false,
        });
        return;
      }
      setIsUpdatingDirName(true);
      // get full path of new directory
      console.log(dirName);
      await renameDir({
        path: `${fullDirName}`,
        newDirName: `${dirPrefix}${dirName}`,
      });
      onClose();
      setIsUpdatingDirName(false);
    } catch (e) {
      toast.error(errorToStringRendererProcess(e), {
        className: 'mt-5',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isUpdatingDirName) {
      sendDirRename();
    }
  };

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className='ml-3 mr-6 mt-2 mb-2 h-full min-w-[400px]'>
        <h2 className='text-xl font-semibold mb-3 text-white'>
          Rename Directory
        </h2>
        <input
          type='text'
          className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out'
          value={dirName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder='New directory Name'
        />
        <Button
          className='bg-blue-600 mt-3 mb-2 border-none h-10 hover:bg-blue-600 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2'
          onClick={sendDirRename}
          placeholder=''
          disabled={isUpdatingDirName}
        >
          Rename
        </Button>
        {errorMessage && <p className='text-red-500 text-xs'>{errorMessage}</p>}
      </div>
    </ReorModal>
  );
};

export default RenameDirModal;
