import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    window.ipcRenderer.receive("indexing-progress", handleProgressUpdate);
  }, []);

  useEffect(() => {
    const handleIndexingError = (error: string) => {
      console.log("Indexing error:", error);
      toast.error(
        `Indexing error you won't be able to use chat nor related notes: ${error}. Please try restarting or send me an email with your error: samlhuillier1@gmail.com`,
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        }
      );
      setIndexingProgress(1);
    };
    window.ipcRenderer.receive("indexing-error", handleIndexingError);
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
      <ToastContainer />
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
