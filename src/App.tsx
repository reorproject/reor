// App.tsx
import React, { useEffect, useState } from "react";
import InitialSetupSettings from "./components/Settings/InitialSettingsPage";
import FileEditorContainer from "./components/FileEditorContainer";
import IndexingProgress from "./components/IndexingProgress";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [
    userHasConfiguredSettingsForIndexing,
    setUserHasConfiguredSettingsForIndexing,
  ] = useState<boolean>(false);

  const [indexingProgress, setIndexingProgress] = useState<number>(0);

  useEffect(() => {
    const handleProgressUpdate = (newProgress: number) => {
      setIndexingProgress(newProgress);
    };
    // Listener stays active for any new indexing that happens from backend
    window.ipcRenderer.receive("indexing-progress", handleProgressUpdate);
  }, []);

  useEffect(() => {
    const initialDirectory = window.electronStore.getUserDirectory();
    const defaultEmbedFunc = window.electronStore.getDefaultEmbedFuncRepo();
    if (initialDirectory && defaultEmbedFunc) {
      setUserHasConfiguredSettingsForIndexing(true);
      window.database.indexFilesInDirectory();
    }
  }, []);

  const handleAllInitialSettingsAreReady = () => {
    setUserHasConfiguredSettingsForIndexing(true);
    window.database.indexFilesInDirectory();
  };

  return (
    <div className="max-h-screen font-sans bg-gray-800">
      {userHasConfiguredSettingsForIndexing ? (
        indexingProgress < 1 ? (
          <IndexingProgress indexingProgress={indexingProgress} />
        ) : (
          <FileEditorContainer />
        )
      ) : (
        <InitialSetupSettings
          readyForIndexing={handleAllInitialSettingsAreReady}
        />
      )}
    </div>
  );
};

export default App;
