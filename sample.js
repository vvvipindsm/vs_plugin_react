export const dd = {
if (!vscode.window.activeTextEditor) {
    return; // no editor
  }
  let { document } = vscode.window.activeTextEditor;
  if (document.uri.scheme !== myScheme) {
    return; // not my scheme
  }
  // get path-components, reverse it, and create a new uri
  let say = document.uri.path;
  let newSay = say
    .split('')
    .reverse()
    .join('');
  let newUri = document.uri.with({ path: newSay });
  await vscode.window.showTextDocument(newUri, { preview: false });
}