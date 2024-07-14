import React, { useEffect, useRef, useState } from 'react';

import InEditorBacklinkSuggestionsDisplay, {
  SuggestionsState,
} from '../Editor/BacklinkSuggestionsDisplay';
import { useFileInfoTree } from '../File/FileSideBar/hooks/use-file-info-tree';

interface Props {
  vaultDirectory: string;
  searchText: string;
  setSearchText: (text: string) => void;
  onSelectSuggestion: (suggestion: string) => void;
  suggestionsState: SuggestionsState | null;
  setSuggestionsState: (state: SuggestionsState | null) => void;
}

export function SearchBarWithFilesSuggestion({
  vaultDirectory,
  searchText,
  setSearchText,
  onSelectSuggestion,
  suggestionsState,
  setSuggestionsState,
}: Props) {
  const { flattenedFiles } = useFileInfoTree(vaultDirectory);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializeSuggestionsStateOnFocus = () => {
    const inputCoords = inputRef.current?.getBoundingClientRect();
    if (!inputCoords) {
      return;
    }

    setSuggestionsState({
      position: {
        top: inputCoords.bottom,
        left: inputCoords.x,
      },
      textWithinBrackets: searchText,
      onSelect: (suggestion) => onSelectSuggestion(`${suggestion}.md`),
    });
  };

  console.log(inputRef.current?.offsetWidth);

  const [sidebarWidth, setSidebarWidth] = useState(0);

  useEffect(() => {
    // Calculate the width of the sidebar
    const calculateWidth = () => {
      if (inputRef.current) {
        setSidebarWidth(inputRef.current.offsetWidth);
      }
      console.log('sidebar width : ', inputRef.current?.offsetWidth);
    };

    // Update width on mount and window resize
    calculateWidth();
    window.addEventListener('resize', calculateWidth);

    // Cleanup event listener
    return () => window.removeEventListener('resize', calculateWidth);
  });

  return (
    <>
      <div className='text-xl font-semibold mb-3 text-white'>
        <input
          ref={inputRef}
          type='text'
          className='block w-full px-3 py-2 mt-6 h-[40px] border border-gray-300 box-border rounded-md
          focus:outline-none focus:shadow-outline-blue focus:border-blue-300
          transition duration-150 ease-in-out'
          value={searchText}
          onSelect={() => initializeSuggestionsStateOnFocus()}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value.length == 0) {
              onSelectSuggestion('');
            }
          }}
          placeholder='Search for the files by name'
        />
        {suggestionsState && (
          <InEditorBacklinkSuggestionsDisplay
            suggestionsState={suggestionsState}
            suggestions={flattenedFiles.map((file) => file.path)}
            maxWidth={`${sidebarWidth}`}
          />
        )}
      </div>
      {!searchText && (
        <p className='text-red-500 text-xs'>
          Choose a file by searching or by right clicking a file in directory
        </p>
      )}
    </>
  );
}
