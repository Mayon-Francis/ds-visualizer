import { Fragment, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-folder-tree/dist/style.css";
import { ipcRenderer } from "electron";

function keepFieldsRecursive(obj, fields) {
  if (obj instanceof Array) {
    let newArr = [];
    for (let item of obj) {
      newArr.push(keepFieldsRecursive(item, fields));
    }
    return newArr;
  } else if (obj instanceof Object) {
    let newObj = {};
    for (let field of fields) {
      if (obj[field]) {
        newObj[field] = keepFieldsRecursive(obj[field], fields);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

interface IFolderContent {
  name: string;
  path: string;
  children?: IFolderContent[];
  size?: number;
  type?: string;
  extension?: string;
}

const Sidebar = () => {
  const FolderTree = dynamic(() => import("react-folder-tree"), {
    ssr: false,
  });
  const [folderContent, setFolderContent] = useState<
    IFolderContent | undefined
  >(undefined);
  const [openTree, setOpenTree] = useState({
    name: "Root",
  });

  function onTreeStateChange(state, event) {
    console.log("state", state);
    console.log("event", event);
  }

  function onFolderStateChange(event, folderContent) {
    
    /**
     * TODO: Known bug: if a change in folder occurs, 
     * open/close state of the tree is lost
     */
    setFolderContent(folderContent);

    const tree = keepFieldsRecursive(folderContent, ["name", "children"]);
    setOpenTree(tree);
  }

  async function openFolder() {
    ipcRenderer.send("open-folder");
  }
  useEffect(() => {
    ipcRenderer.on("folder-change", onFolderStateChange);
  }, []);

  return (
    <Fragment>
      <div className="sidebar-controls">
        <button className="sidebar-openFolder" onClick={openFolder}>
          Open Folder
        </button>
      </div>
      {folderContent ? (
        <FolderTree
          data={openTree}
          onChange={onTreeStateChange}
          showCheckbox={false}
          indentPixels={15}
        />
      ) : (
        <div className="sidebar-empty">
          <p>Open a folder to see its contents</p>
        </div>
      )}
    </Fragment>
  );
};

export default Sidebar;
