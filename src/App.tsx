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
  const [windowVaultDirectory, setWindowVaultDirectory] = useState<string>("");

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
    window.ipcRenderer.receive("indexing-error", handleIndexingError);
  }, []);

  useEffect(() => {
    window.ipcRenderer.receive("window-vault-directory", (dir: string) => {
      setWindowVaultDirectory(dir);
      setUserHasConfiguredSettingsForIndexing(true);
      window.database.indexFilesInDirectory(dir);
    });
  }, []);

  const handleAllInitialSettingsAreConfigured = (windowVaultDir: string) => {
    setUserHasConfiguredSettingsForIndexing(true);

    window.electronStore.setCurrentWindowsVaultDirectory(windowVaultDir);
    window.database.indexFilesInDirectory(windowVaultDir);
    setWindowVaultDirectory(windowVaultDir);
  };

  return (
    <div className="max-h-screen font-sans bg-gray-800">
      <ToastContainer />
      {userHasConfiguredSettingsForIndexing ? (
        indexingProgress < 1 ? (
          <IndexingProgress indexingProgress={indexingProgress} />
        ) : (
          <FileEditorContainer windowVaultDirectory={windowVaultDirectory} />
        )
      ) : (
        <InitialSetupSinglePage
          finishedSettingInitialSettings={handleAllInitialSettingsAreConfigured}
        />
      )}
    </div>
  );
};

export default App;
