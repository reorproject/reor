import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileEditorContainer from "./components/FileEditorContainer";
import IndexingProgress from "./components/IndexingProgress";
import InitialSetupSinglePage from "./components/Settings/InitialSettingsSinglePage";

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
      toast.error(error, {
        className: "mt-5",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
      setIndexingProgress(1);
    };
    window.ipcRenderer.receive(
      "error-to-display-in-window",
      handleIndexingError
    );
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const [initialDirectory, defaultEmbedFunc] = await Promise.all([
        window.electronStore.getVaultDirectoryForWindow(),
        window.electronStore.getDefaultEmbeddingModel(),
      ]);
      if (initialDirectory && defaultEmbedFunc) {
        setUserHasConfiguredSettingsForIndexing(true);
        window.database.indexFilesInDirectory();
      }
    };

    fetchSettings();
  }, []);

  const handleAllInitialSettingsAreReady = () => {
    setUserHasConfiguredSettingsForIndexing(true);
    window.database.indexFilesInDirectory();
  };

  return (
    <div className="max-h-screen font-sans bg-neutral-800">
      <ToastContainer className="mt-4" />
      {userHasConfiguredSettingsForIndexing ? (
        indexingProgress < 1 ? (
          <IndexingProgress indexingProgress={indexingProgress} />
        ) : (
          <FileEditorContainer />
        )
      ) : (
        <InitialSetupSinglePage
          readyForIndexing={handleAllInitialSettingsAreReady}
        />
      )}
    </div>
  );
};

export default App;
