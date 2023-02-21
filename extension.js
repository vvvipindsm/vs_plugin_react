const { TextEncoder } = require("util");
const vscode = require("vscode");

// const  actionTemplete  = require("./action_templete");
// const { actionTemplete } = require("./templetes/action");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const commds = ["MY-CRUD-LIST-INFINITITYSCROLL", "CLEAR","AUTO", "CSS_ADD", "API_PARTIAL",];
  let sectionName;
  console.log(">>comme",context.extension.extensionKind);
  if (commds[context.extension.extensionKind] != "CSS_ADD") {
    if (commds[context.extension.extensionKind] == "CLEAR") {
      sectionName = "";
    } else {
      if (commds[context.extension.extensionKind] != "CSS_ADD") {
        sectionName = await vscode.window.showInputBox();
        if (sectionName == "") return null;
      }
    }
  }
  let css_adding = vscode.commands.registerCommand(
    "my.cssadd",
    async function () {
      const rootProjectPath = vscode.workspace.rootPath;

      let { document } = vscode.window.activeTextEditor;
      let activeEditor = vscode.window.activeTextEditor;
      let curSorLine = activeEditor.selection.active.line;
      const activeLineText = document.lineAt(curSorLine);
      // console.log('>>',curSorLine,activeEditor)
      const currentFilePath = document.uri.path;
      const activeFileCode = document.getText();
      //   const activeFileLineCount = document.lineCount;
      const currentActiveFileData = document.uri.scheme;

      const styleInp = await vscode.window.showInputBox();

      const pos = curSorLine;
      const temp = activeFileCode;
      const realDat = temp.split("\n");

      const arrTemp = temp.split("\n");

      const beforeArr = arrTemp.slice(0, pos).reverse();
      const beforeIdx = pos - 1 - beforeArr.findIndex((t) => /style/.test(t));

      const aftereArr = arrTemp.slice(pos, -1);
      const afterIdx = pos + aftereArr.findIndex((t) => /}}/.test(t));

      let styleTemp = [`${styleInp}: {`];
      styleTemp.push(arrTemp.slice(beforeIdx + 1, afterIdx).join("\n"));
      styleTemp.push("},");

      const classTemp = `style={styles.${styleInp}}`;
      arrTemp.splice(beforeIdx, afterIdx - (beforeIdx - 1), classTemp);
      const realDat1 = JSON.parse(JSON.stringify(arrTemp));
      const appendIndex = realDat1
        .reverse()
        .findIndex((value) => /const styles/.test(value));

      const styleShetindx = arrTemp.length - appendIndex;

      arrTemp.splice(
        styleShetindx,
        0,
        styleTemp.join("\n").replaceAll(/,,/gi, ",")
      );

      console.log(">>", arrTemp.join("\n"));
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(currentFilePath),
        new TextEncoder().encode(arrTemp.join("\n"))
      );
      vscode.workspace
        .openTextDocument(currentFilePath)
        .then((doc) => vscode.window.showTextDocument(doc, { preview: true }));
    }
  );

  let partical_api_adding = vscode.commands.registerCommand(
    "my.particalapiadding",
    async function () {
      let actionName = "";
      if (sectionName == "") {
        sectionName = await vscode.window.showInputBox();
        if (sectionName == "") return null;
      }
      actionName = await vscode.window.showInputBox();
      if (actionName == "") return "";
      const rootProjectPath = vscode.workspace.rootPath;

      // console.log('root',rootProjectPath)
      const SECTION_NAME = sectionName;
      let { document } = vscode.window.activeTextEditor;
      let activeEditor = vscode.window.activeTextEditor;
      let curSorLine = activeEditor.selection.active.line;
      const activeLineText = document.lineAt(curSorLine);
      // console.log('>>',curSorLine,activeEditor)
      const currentFilePath = document.uri.path;
      const activeFileCode = document.getText();
      //   const activeFileLineCount = document.lineCount;
      const currentActiveFileData = document.uri.scheme;
      //reducers start
      let reducerExisting = await getFileIntoStringData(
        `/src/Redux/${SECTION_NAME}Reducer.js`,
        rootProjectPath,
        "array"
      );

      const importTempAdded = addImportToFile(
        reducerExisting,
        `${actionName.toUpperCase()},`
      );
      const addContantValue = addContantValues(actionName);
      let ReducerData = parseApiReducerData({ SECTION_NAME: actionName });

      const appendIndex = importTempAdded.findIndex((value) =>
        /default:/.test(value)
      );
      const appendInitStateIndex = importTempAdded.findIndex((value) =>
        /.*?InitialState/.test(value)
      );
      importTempAdded.splice(appendInitStateIndex + 1, 0, addContantValue);
      importTempAdded.splice(appendIndex + 1, 0, ReducerData.join("\n"));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Reducer.js`
        ),
        new TextEncoder().encode(importTempAdded.join("\n"))
      );

      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Reducer.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));
      //reducer end

      //opening
      //action start
      let actionExisting = await getFileIntoStringData(
        `/src/Redux/${SECTION_NAME}Action.js`,
        rootProjectPath,
        "array"
      );
      const importTempAddedAction = parseApiActionImportDataData({
        SECTION_NAME: actionName,
      });

      let ActionData = parseApiActionData({ SECTION_NAME: actionName.toUpperCase() });

      actionExisting.splice(0, 0, importTempAddedAction.join("\n"));
      actionExisting.splice(-1, 0, ActionData.join("\n"));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Action.js`
        ),
        new TextEncoder().encode(actionExisting.join("\n"))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Action.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));
      //action end

      //dispathcer start

      let dispatcherExisting = await getFileIntoStringData(
        `/src/Redux/${SECTION_NAME}Dispatcher.js`,
        rootProjectPath,
        "array"
      );
      const importTempAddedDispatcher = addImportToFile(
        dispatcherExisting,
        parseApiDispatcherImporterData({ SECTION_NAME: actionName })
      );

      let ActionDataDispatcher = parseApiDispatcherData({
        SECTION_NAME: actionName,
      });

      importTempAddedDispatcher.push(ActionDataDispatcher.join("\n"));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Dispatcher.js`
        ),
        new TextEncoder().encode(importTempAddedDispatcher.join("\n"))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Dispatcher.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      //dispascher end

      //react-page
      const activeCodeArr = activeFileCode.split("\n");
      activeCodeArr.splice(
        curSorLine + 1,
        0,
        `
      import { fetch${actionName} } from "../../Redux/${SECTION_NAME}Dispatcher";
      const dispatch${SECTION_NAME} = useDispatch([fetch${actionName}]);
      `
      );
      // console.log('>>',currentFilePath)
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(currentFilePath),
        new TextEncoder().encode(activeCodeArr.join("\n"))
      );
      vscode.workspace
        .openTextDocument(`${currentFilePath}`)
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      const constTempBuffer = await vscode.workspace.fs.readFile(
        vscode.Uri.file(`${rootProjectPath}/src/Utilities/API/ApiConstants.js`)
      );
      let constTemp = constTempBuffer.toString();
      constTemp = constTemp.replace(
        "export const endPoints = {",
        `export const endPoints = {
        ${actionName.toUpperCase()}: 'api/${sectionName.toLocaleLowerCase()}',`
      );

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(`${rootProjectPath}/src/Utilities/API/ApiConstants.js`),
        new TextEncoder().encode(constTemp)
      );
      vscode.workspace
        .openTextDocument(
          vscode.Uri.file(
            `${rootProjectPath}/src/Utilities/API/ApiConstants.js`
          )
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));
    }
  );

  let disposable = vscode.commands.registerCommand(
    "my.crudPack",
    async function () {
      const params = [
        { label: "action", details: "Action Folder" },
        { label: "Reducers", details: "Reducers Folder" },
        { label: "Screen", details: "screen Folder" },
        { label: "Component", details: "component Folder" },
      ];
      if (sectionName == "") {
        sectionName = await vscode.window.showInputBox();
        if (sectionName == "") return null;
      }

      const rootProjectPath = vscode.workspace.rootPath;

      // console.log('root',rootProjectPath)
      const SECTION_NAME = sectionName;
      let { document } = vscode.window.activeTextEditor;
      let activeEditor = vscode.window.activeTextEditor;
      let curSorLine = activeEditor.selection.active.line;
      const activeLineText = document.lineAt(curSorLine);
      // console.log('>>',curSorLine,activeEditor)
      const currentFilePath = document.uri.path;
      const activeFileCode = document.getText();
      //   const activeFileLineCount = document.lineCount;
      const currentActiveFileData = document.uri.scheme;

      //react-page
      const activeCodeArr = activeFileCode.split("\n");
      activeCodeArr.splice(
        curSorLine + 1,
        0,
        `
      import { get${SECTION_NAME} } from "../../Redux/${SECTION_NAME}Dispatcher";
      const dispatch${SECTION_NAME}= useDispatch([get${SECTION_NAME}]);
      let SECTION_NAME = useSelector((state) => state.SECTION_NAME);
      `
      );
      // console.log('>>',currentFilePath)
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(currentFilePath),
        new TextEncoder().encode(activeCodeArr.join("\n"))
      );
      vscode.workspace
        .openTextDocument(`${currentFilePath}`)
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Action.js`
        ),
        new TextEncoder().encode(actionTemplete({ SECTION_NAME }))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Action.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Reducer.js`
        ),
        new TextEncoder().encode(reducerTemplete({ SECTION_NAME }))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Reducer.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Dispatcher.js`
        ),
        new TextEncoder().encode(dispatchTemplete({ SECTION_NAME }))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Dispatcher.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      const reduxTempBuffer = await vscode.workspace.fs.readFile(
        vscode.Uri.file(`${rootProjectPath}/src/Redux/Reducers.js`)
      );
      let reduxTemp = reduxTempBuffer.toString();
      reduxTemp = reduxTemp.replace(
        "const appReducer = combineReducers({",
        `import ${sectionName}Reducer from "./${sectionName}Reducer";

        const appReducer = combineReducers({
        ${SECTION_NAME.toLocaleLowerCase()}: ${SECTION_NAME}Reducer,`
      );

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(`${rootProjectPath}/src/Redux/Reducers.js`),
        new TextEncoder().encode(reduxTemp)
      );
      let doc = await vscode.workspace.openTextDocument(
        `${rootProjectPath}/src/Redux/Reducers.js`
      );
      vscode.window.showTextDocument(doc, { preview: false });

      const constTempBuffer = await vscode.workspace.fs.readFile(
        vscode.Uri.file(`${rootProjectPath}/src/Utilities/API/ApiConstants.js`)
      );
      let constTemp = constTempBuffer.toString();
      constTemp = constTemp.replace(
        "export const endPoints = {",
        `export const endPoints = {
      ${SECTION_NAME.toUpperCase()}: 'api/bcae-tenant',`
      );

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(`${rootProjectPath}/src/Utilities/API/ApiConstants.js`),
        new TextEncoder().encode(constTemp)
      );

      // console.log('current file path',currentFilePath)
      // console.log('file data',document.getWordRangeAtPosition())
      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from My!'+typeOfFile.label);
    }
  );

  let disposableinfinityScoll = vscode.commands.registerCommand(
    "my.crudPacklistInfinityscroll",
    async function () {
      const params = [
        { label: "action", details: "Action Folder" },
        { label: "Reducers", details: "Reducers Folder" },
        { label: "Screen", details: "screen Folder" },
        { label: "Component", details: "component Folder" },
      ];
      if (sectionName == "") {
        sectionName = await vscode.window.showInputBox();
        if (sectionName == "") return null;
      }

      const rootProjectPath = vscode.workspace.rootPath;

      // console.log('root',rootProjectPath)
      const SECTION_NAME = sectionName;
      let { document } = vscode.window.activeTextEditor;
      let activeEditor = vscode.window.activeTextEditor;
      let curSorLine = activeEditor.selection.active.line;
      const activeLineText = document.lineAt(curSorLine);
      // console.log('>>',curSorLine,activeEditor)
      const currentFilePath = document.uri.path;
      const activeFileCode = document.getText();
      //   const activeFileLineCount = document.lineCount;
      const currentActiveFileData = document.uri.scheme;

      //react-page
      const activeCodeArr = activeFileCode.split("\n");
      activeCodeArr.splice(
        curSorLine + 1,
        0,
        `
      import { get${SECTION_NAME} } from "../../Redux/${SECTION_NAME}Dispatcher";
      const dispatch${SECTION_NAME}= useDispatch([${SECTION_NAME}]);
      const fetch${SECTION_NAME}Data = (page) => {
        dispatch(get${SECTION_NAME}Data(page));
      };
      useEffect(() => {
        fetch${SECTION_NAME}Data(0);
      }, []);
      const LoadMoreRandomData = () => {
        if (dispatch${SECTION_NAME}.noData) fetch${SECTION_NAME}Data(dispatch${SECTION_NAME}.page + 1);
      };
      {
        !dispatch${SECTION_NAME}?.init${SECTION_NAME} && dispatch${SECTION_NAME}?.${SECTION_NAME}Data.length > 0 && (
          <View style={[{ height: 230 }, styles.bottomView]}>
            <FlatList
              horizontal
              onScroll={onScroll}
              data={dispatch${SECTION_NAME}?.${SECTION_NAME}Data}
              onEndReachedThreshold={0.5}
              onEndReached={LoadMoreRandomData}
              renderItem={({ item }, data) => {
                return (
                  <ListItem
                    title={
                      item.serviceTypeDesc
                        ? item.serviceTypeDesc
                        : item.ticketTypeDesc
                    }
                    type={item.intxnType}
                    status={item.currStatusDesc}
                    ticketNo={item.intxnId}
                    date={item.createdAt}
                    address={getAddressFromResponse(item)}
                  />
                );
              }}
              showsHorizontalScrollIndicator={false}
              ListFooterComponent={() => {
                if (noData) {
                  return null;
                }
                return (
                  <View style={{ marginBottom: spacing.HEIGHT_30 }}>
                    <ActivityIndicator size="large" />
                  </View>
                );
              }}
            />
          </View>
        );
      }
      {
        dispatch${SECTION_NAME}?.init${SECTION_NAME}Background && <ActivityIndicator />;
      }
      
      `
      );
      // console.log('>>',currentFilePath)
      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(currentFilePath),
        new TextEncoder().encode(activeCodeArr.join("\n"))
      );
      vscode.workspace
        .openTextDocument(`${currentFilePath}`)
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Action.js`
        ),
        new TextEncoder().encode(actionTemplete({ SECTION_NAME }))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Action.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Reducer.js`
        ),
        new TextEncoder().encode(reducerTempleteInfinity({ SECTION_NAME }))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Reducer.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Dispatcher.js`
        ),
        new TextEncoder().encode(dispatchTempleteInfinityScroll({ SECTION_NAME }))
      );
      vscode.workspace
        .openTextDocument(
          `${rootProjectPath}/src/Redux/${SECTION_NAME}Dispatcher.js`
        )
        .then((doc) => vscode.window.showTextDocument(doc, { preview: false }));

      const reduxTempBuffer = await vscode.workspace.fs.readFile(
        vscode.Uri.file(`${rootProjectPath}/src/Redux/Reducers.js`)
      );
      let reduxTemp = reduxTempBuffer.toString();
      reduxTemp = reduxTemp.replace(
        "const appReducer = combineReducers({",
        `import ${sectionName}Reducer from "./${sectionName}Reducer";

        const appReducer = combineReducers({
        ${SECTION_NAME.toLocaleLowerCase()}: ${SECTION_NAME}Reducer,`
      );

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(`${rootProjectPath}/src/Redux/Reducers.js`),
        new TextEncoder().encode(reduxTemp)
      );
      let doc = await vscode.workspace.openTextDocument(
        `${rootProjectPath}/src/Redux/Reducers.js`
      );
      vscode.window.showTextDocument(doc, { preview: false });

      const constTempBuffer = await vscode.workspace.fs.readFile(
        vscode.Uri.file(`${rootProjectPath}/src/Utilities/API/ApiConstants.js`)
      );
      let constTemp = constTempBuffer.toString();
      constTemp = constTemp.replace(
        "export const endPoints = {",
        `export const endPoints = {
      ${SECTION_NAME.toUpperCase()}: 'api/bcae-tenant',`
      );

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(`${rootProjectPath}/src/Utilities/API/ApiConstants.js`),
        new TextEncoder().encode(constTemp)
      );

      // console.log('current file path',currentFilePath)
      // console.log('file data',document.getWordRangeAtPosition())
      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from My!'+typeOfFile.label);
    }
  );

  let clearSection = vscode.commands.registerCommand(
    "my.clearSection",
    async function () {
      const rootProjectPath = vscode.workspace.rootPath;

      sectionName = "";
      // console.log("clear section", sectionName);
    }
  );
  

  context.subscriptions.push(css_adding);
  context.subscriptions.push(disposable);
  context.subscriptions.push(clearSection);
  context.subscriptions.push(partical_api_adding);
  context.subscriptions.push(disposableinfinityScoll);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

const actionTemplete = ({ SECTION_NAME }) => {
  return `export const ${SECTION_NAME.toUpperCase()}_INIT = '${SECTION_NAME.toUpperCase()}_INIT';
export const ${SECTION_NAME.toUpperCase()}_DATA = '${SECTION_NAME.toUpperCase()}_DATA';
export const ${SECTION_NAME.toUpperCase()}_ERROR = '${SECTION_NAME.toUpperCase()}_ERROR';

export function init${SECTION_NAME}Data() {
    return { type: ${SECTION_NAME.toUpperCase()}_INIT,  }
}

export function set${SECTION_NAME}Data(data) {
    return { type: ${SECTION_NAME.toUpperCase()}_DATA, data }
}

export function set${SECTION_NAME}Error(data) {
    return { type: ${SECTION_NAME.toUpperCase()}_ERROR, data }
}
`;
};

const reducerTemplete = ({ SECTION_NAME }) => {
  const section_cap = SECTION_NAME.toUpperCase();
  const section_low = SECTION_NAME.toLowerCase();

  return `import { ${section_cap}_INIT, ${section_cap}_DATA, ${section_cap}_ERROR } from './${SECTION_NAME}Action'

  const ${section_low}InitialState = {
      init${SECTION_NAME}: false,
      is${SECTION_NAME}Error: false,
      ${section_low}Data: {},
  }
  
  const ${SECTION_NAME}Reducer = (state = ${section_low}InitialState, action) => {
      switch (action.type) {
          case ${section_cap}_INIT:
              return {
                  ...state,
                  init${SECTION_NAME}: true,
                  is${SECTION_NAME}Error: false,
                  ${section_low}Data: {},
              }
  
          case ${section_cap}_ERROR:
              return {
                  ...state,
                  init${SECTION_NAME}: false,
                  is${SECTION_NAME}Error: true,
                  ${section_low}Data: action.data,
              }
  
          case ${section_cap}_DATA:
              return {
                  ...state,
                  init${SECTION_NAME}: false,
                  is${SECTION_NAME}Error: false,
                  ${section_low}Data: action.data,
              }
          default:
              return state;
      }
  }
  export default ${SECTION_NAME}Reducer;`;
};

const reducerTempleteInfinity = ({ SECTION_NAME }) => {
  const section_cap = SECTION_NAME.toUpperCase();
  const section_low = SECTION_NAME.toLowerCase();

  return `import { ${section_cap}_INIT, ${section_cap}_DATA, ${section_cap}_ERROR } from './${SECTION_NAME}Action'
  import get from "lodash.get";
  const ${section_low}InitialState = {
      init${SECTION_NAME}: false,
      is${SECTION_NAME}Error: false,
      ${section_low}Data: {},
      page: 0,
      noData: false,
  }
  
  const ${SECTION_NAME}Reducer = (state = ${section_low}InitialState, action) => {
      switch (action.type) {
          case ${section_cap}_INIT:
              return {
                  ...state,
                  init${SECTION_NAME}: true,
                  is${SECTION_NAME}Error: false,
                  ${section_low}Data: {},
                  noData: false,
                  page: 0,
              }
  
          case ${section_cap}_ERROR:
              return {
                  ...state,
                  init${SECTION_NAME}: false,
                  is${SECTION_NAME}Error: true,
                  ${section_low}Data: action.data,
              }
  
          case ${section_cap}_DATA:
            const page = action.data.page;
            const count = get(action, "data.result.length", 0);
            const lenData = get(action, "data.result.length", 0);
            if (lenData === 0)
            return {
              ...state,
              noData: true,
              init${SECTION_NAME}: false,
              init${SECTION_NAME}Background: false,
            };
            return {
              ...state,
              page,
              noData: false,
              init${SECTION_NAME}: false,
              is${SECTION_NAME}Error: false,
              ${section_low}Data:
                page === 0
                  ? action.data.result
                  : [...state.${section_low}Data, ...action.data.result],
              init${SECTION_NAME}Background: false,
            };
          default:
              return state;
      }
  }
  export default ${SECTION_NAME}Reducer;`;
};
const dispatchTempleteInfinityScroll = ({ SECTION_NAME }) => {
  const section_cap = SECTION_NAME.toUpperCase();
  const section_low = SECTION_NAME.toLowerCase();

  return `import { init${SECTION_NAME}Data, set${SECTION_NAME}Data, set${SECTION_NAME}Error } from './${SECTION_NAME}Action';
  import { serverCall } from "../Utilities/API";
  import { endPoints, requestMethod } from "../../src/Utilities/API/ApiConstants";
  import get from "lodash.get";
  const EMPTY_DATA = [
  ]
  const DATA = [
    
  ]
  export const get${SECTION_NAME}Data = (page = 0) => {
      return async (dispatch) => {
        if (page === 0)  dispatch(init${SECTION_NAME}Data());
      
          let params = {
            
      };
      let result = await serverCall(endPoints.${SECTION_NAME.toUpperCase()}?limit=3&page=3, requestMethod.POST, params)
      if (result.success) {
          dispatch(set${SECTION_NAME}Data({result: result?.data?.data, page: page}));
        } else {
           dispatch(set${SECTION_NAME}Error(result));
        }
      };
  }`;
};
const dispatchTemplete = ({ SECTION_NAME }) => {
  const section_cap = SECTION_NAME.toUpperCase();
  const section_low = SECTION_NAME.toLowerCase();

  return `import { init${SECTION_NAME}Data, set${SECTION_NAME}Data, set${SECTION_NAME}Error } from './${SECTION_NAME}Action';
  import { serverCall } from "../Utilities/API";
  import { endPoints, requestMethod } from "../../src/Utilities/API/ApiConstants";
  const EMPTY_DATA = [
  ]
  const DATA = [
    
  ]
  export const get${SECTION_NAME}Data = () => {
      return async (dispatch) => {
          dispatch(init${SECTION_NAME}Data());
          let params = {
            
      };
          let result = await serverCall(endPoints.${SECTION_NAME.toUpperCase()}, requestMethod.POST, params)
          if (result.success) {
              dispatch(set${SECTION_NAME}Data(DATA));
          } else {
              dispatch(set${SECTION_NAME}Error(DATA));
          }
      };
  }`;
};

const getFileIntoStringData = async (uri, rootProjectPath, type) => {
  const reduxTempBuffer = await vscode.workspace.fs.readFile(
    vscode.Uri.file(`${rootProjectPath}${uri}`)
  );
  let reduxTemp = reduxTempBuffer.toString();

  return reduxTemp.split("\n");
};

const parseApiDispatcherData = ({ SECTION_NAME }) => {
  const code = `   export const ${SECTION_NAME}Data = () => {
      return async (dispatch) => {
          dispatch(init${SECTION_NAME}Data());
          let params = {
            
          };
          let result = await serverCall(endPoints.${SECTION_NAME.toUpperCase()}, requestMethod.POST, params)
          if (result.success) {
              console.log("success ${SECTION_NAME}",result)
              dispatch(set${SECTION_NAME}Data(result?.data));
          } else {
              console.log("error ${SECTION_NAME}",result)
              dispatch(set${SECTION_NAME}Error(result));
          }
      };
  }`;
  return code.split("\n");
};

const parseApiDispatcherImporterData = ({ SECTION_NAME }) => {
  const code = `set${SECTION_NAME}Data, set${SECTION_NAME}Error`;
  return code;
};

const parseApiReducerData = ({ SECTION_NAME }) => {
  const code = `case ${SECTION_NAME.toUpperCase()}_ERROR:
  return {
      ...state,
      init${SECTION_NAME}: false,
      is${SECTION_NAME}Error: true,
      ${SECTION_NAME.toLocaleLowerCase()}Data: action.data,
  }

case ${SECTION_NAME.toUpperCase()}_DATA:
  return {
      ...state,
      init${SECTION_NAME}: false,
      is${SECTION_NAME}Error: false,
      ${SECTION_NAME.toLocaleLowerCase()}Data: action.data,
  }`;
  return code.split("\n");
};

const parseApiReducerImportData = ({ SECTION_NAME }) => {
  const code = `${SECTION_NAME.toUpperCase()}_DATA,${SECTION_NAME.toUpperCase()}_ERROR`;
  return code;
};
const parseApiActionData = ({ SECTION_NAME }) => {
  const code = ` export const set${SECTION_NAME}Data =(data) => {
    return { type: ${SECTION_NAME}_DATA, data }
}

export const set${SECTION_NAME}_ERROR = (data) => {
    return { type: ${SECTION_NAME}_ERROR, data }
}`;
  return code.split("\n");
};

const parseApiActionDataImport = ({ SECTION_NAME }) => {
  const code = `export const ${SECTION_NAME}_ERROR = '${SECTION_NAME}_ERROR';
  export const ${SECTION_NAME}_DATA = '${SECTION_NAME}_DATA';`;
  return code.split("\n");
};
const parseApiActionImportDataData = ({ SECTION_NAME }) => {
  const code = ` export const ${SECTION_NAME.toUpperCase()}_DATA = '${SECTION_NAME.toUpperCase()}_DATA';
  export const ${SECTION_NAME.toUpperCase()}_ERROR = '${SECTION_NAME.toUpperCase()}_ERROR';`;
  return code.split("\n");
};

const findIndexToAppend = (temp, search) => {
  const t = temp.findIndex((value) => /^search=/.test(value));
  console.log(">>", t != -1, t);
};
const addContantValues = (actionName) => {
  const temp = ` is${actionName}Error: false,${actionName}Data: {},`;
  return temp;
};
const addImportToFile = (temp, actionsTxt) => {
  const idx = temp.findIndex((v) => /{/.test(v));

  console.log(">>", idx);
  const importTemp = temp[idx].split(",");

  console.log(">>", importTemp);

  //   importTemp.splice(idx, 0, "actionsTxt,sdsdsd");

  temp.splice(idx + 1, 0, actionsTxt);
  return temp;
};
