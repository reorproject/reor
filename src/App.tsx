import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Portal } from "@headlessui/react";
import "react-toastify/dist/ReactToastify.css";
import FileEditorContainer from "./components/FileEditorContainer";
import IndexingProgress from "./components/IndexingProgress";
import InitialSetupSinglePage from "./components/Settings/InitialSettingsSinglePage";
import posthog from "posthog-js";

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
    const initialisePosthog = async () => {
      if (await window.electronStore.getAnalyticsMode()) {
        posthog.init("phc_xi4hFToX1cZU657yzge1VW0XImaaRzuvnFUdbAKI8fu", {
          api_host: "https://us.i.posthog.com",
          autocapture: false,
        });
        posthog.register({
          reorAppVersion: await window.electron.getReorAppVersion(),
      });
      }
    };
    initialisePosthog();
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
      <Portal>
        <ToastContainer className="mt-4" />
      </Portal>
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
